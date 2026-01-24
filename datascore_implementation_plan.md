# DataScore: Pre-Training Data Quality for LLM Fine-Tuning

## Implementation Plan (100 Hours)

---

## Executive Summary

**Project:** DataScore - A predictive data quality framework for LLM fine-tuning datasets

**Core Contribution:** First tool that scores training data BEFORE fine-tuning, predicting downstream model performance and enabling targeted data curation.

**Timeline:** 4 weeks (100 hours total)

**Target Venue:** Data-Centric AI Workshop @ NeurIPS/ICML, or DEEM @ SIGMOD

---

## Phase 1: Foundation & Core Metrics (Week 1 - 25 hours)

### Day 1-2: Project Setup (5 hours)

**Environment Setup:**
```bash
# Create project structure
mkdir -p datascore/{metrics,utils,evaluation,data}
python -m venv datascore-env
source datascore-env/bin/activate

# Install dependencies
pip install sentence-transformers numpy scikit-learn pandas
pip install datasets transformers  # For loading public datasets
pip install google-generativeai   # For clarity metric (free tier)
```

**Project Structure:**
```
datascore/
├── datascore/
│   ├── __init__.py
│   ├── scorer.py           # Main DataScorer class
│   ├── metrics/
│   │   ├── __init__.py
│   │   ├── diversity.py    # Diversity metric
│   │   ├── consistency.py  # Consistency metric
│   │   ├── complexity.py   # Complexity metric
│   │   └── clarity.py      # Clarity metric
│   ├── utils/
│   │   ├── embeddings.py   # Embedding utilities
│   │   └── io.py           # Data loading
│   └── reports/
│       └── report.py       # Score reports
├── experiments/
│   ├── validation.py       # Correlation experiments
│   └── ablation.py         # Ablation studies
├── data/                   # Downloaded datasets
├── results/                # Experiment results
├── paper/                  # LaTeX paper
└── tests/
```

**Deliverable:** Working project skeleton with dependencies installed

---

### Day 2-3: Implement Diversity Metric (6 hours)

**Concept:** Measure topic/instruction coverage using embedding clustering

**Algorithm:**
```python
# datascore/metrics/diversity.py

from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
import numpy as np

class DiversityScorer:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.encoder = SentenceTransformer(model_name)
    
    def compute_diversity(self, instructions: list[str], n_clusters: int = 20) -> dict:
        """
        Compute diversity score based on embedding distribution.
        
        Returns:
            - cluster_entropy: How evenly distributed across clusters
            - coverage_score: Fraction of clusters with examples
            - overall_diversity: Combined score (0-1)
        """
        # Get embeddings
        embeddings = self.encoder.encode(instructions)
        
        # Cluster
        n_clusters = min(n_clusters, len(instructions) // 5)
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        labels = kmeans.fit_predict(embeddings)
        
        # Compute entropy of cluster distribution
        unique, counts = np.unique(labels, return_counts=True)
        probs = counts / len(labels)
        entropy = -np.sum(probs * np.log(probs + 1e-10))
        max_entropy = np.log(n_clusters)
        normalized_entropy = entropy / max_entropy
        
        # Coverage: what fraction of clusters have at least 1 example
        coverage = len(unique) / n_clusters
        
        # Silhouette score (cluster quality)
        silhouette = silhouette_score(embeddings, labels) if len(unique) > 1 else 0
        
        return {
            'cluster_entropy': float(normalized_entropy),
            'coverage_score': float(coverage),
            'silhouette': float(silhouette),
            'diversity_score': float(0.5 * normalized_entropy + 0.3 * coverage + 0.2 * max(0, silhouette))
        }
```

**Deliverable:** Working diversity metric with unit tests

---

### Day 3-4: Implement Consistency Metric (5 hours)

**Concept:** Detect contradictory instruction-response pairs

**Algorithm:**
```python
# datascore/metrics/consistency.py

from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class ConsistencyScorer:
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2', threshold: float = 0.85):
        self.encoder = SentenceTransformer(model_name)
        self.threshold = threshold
    
    def find_contradictions(self, data: list[dict]) -> dict:
        """
        Find instruction-response pairs that may contradict each other.
        
        Args:
            data: List of {'instruction': str, 'response': str}
        
        Returns:
            - contradiction_pairs: List of potentially contradicting indices
            - consistency_score: Overall score (1 - contradiction_rate)
        """
        instructions = [d['instruction'] for d in data]
        responses = [d['response'] for d in data]
        
        # Embed instructions
        inst_embeddings = self.encoder.encode(instructions)
        
        # Find similar instructions
        sim_matrix = cosine_similarity(inst_embeddings)
        
        contradictions = []
        for i in range(len(data)):
            for j in range(i + 1, len(data)):
                if sim_matrix[i, j] > self.threshold:
                    # Similar instructions - check if responses are different
                    resp_sim = self._response_similarity(responses[i], responses[j])
                    if resp_sim < 0.5:  # Low response similarity = potential contradiction
                        contradictions.append({
                            'idx_1': i, 
                            'idx_2': j,
                            'inst_sim': float(sim_matrix[i, j]),
                            'resp_sim': float(resp_sim)
                        })
        
        contradiction_rate = len(contradictions) / max(len(data), 1)
        
        return {
            'contradictions': contradictions[:100],  # Limit for output
            'num_contradictions': len(contradictions),
            'consistency_score': float(1 - min(contradiction_rate * 10, 1))  # Scale appropriately
        }
    
    def _response_similarity(self, resp1: str, resp2: str) -> float:
        emb = self.encoder.encode([resp1, resp2])
        return float(cosine_similarity([emb[0]], [emb[1]])[0, 0])
```

**Deliverable:** Working consistency metric

---

### Day 4-5: Implement Complexity Metric (4 hours)

**Concept:** Measure instruction difficulty distribution

**Algorithm:**
```python
# datascore/metrics/complexity.py

import re
from collections import Counter

class ComplexityScorer:
    # Task type keywords
    TASK_KEYWORDS = {
        'generation': ['write', 'create', 'generate', 'compose', 'draft'],
        'analysis': ['analyze', 'evaluate', 'assess', 'examine', 'review'],
        'qa': ['what', 'why', 'how', 'explain', 'describe'],
        'coding': ['code', 'function', 'implement', 'program', 'script'],
        'reasoning': ['solve', 'calculate', 'prove', 'derive', 'deduce'],
        'summarization': ['summarize', 'summarise', 'brief', 'tldr', 'overview'],
    }
    
    def compute_complexity(self, instructions: list[str]) -> dict:
        """
        Analyze complexity distribution of instructions.
        """
        complexities = [self._instruction_complexity(inst) for inst in instructions]
        task_types = [self._detect_task_type(inst) for inst in instructions]
        
        # Complexity distribution
        complexity_scores = [c['score'] for c in complexities]
        
        # Task type distribution
        type_counts = Counter(task_types)
        type_entropy = self._entropy(list(type_counts.values()))
        
        return {
            'mean_complexity': float(np.mean(complexity_scores)),
            'std_complexity': float(np.std(complexity_scores)),
            'task_type_distribution': dict(type_counts),
            'task_type_entropy': float(type_entropy),
            'complexity_score': float(self._overall_complexity_score(complexities, type_counts))
        }
    
    def _instruction_complexity(self, instruction: str) -> dict:
        words = instruction.split()
        sentences = re.split(r'[.!?]', instruction)
        
        return {
            'word_count': len(words),
            'sentence_count': len([s for s in sentences if s.strip()]),
            'avg_word_length': np.mean([len(w) for w in words]) if words else 0,
            'has_constraints': any(kw in instruction.lower() for kw in ['must', 'should', 'exactly', 'only']),
            'score': min(len(words) / 50, 1) * 0.5 + (len([s for s in sentences if s.strip()]) / 5) * 0.5
        }
    
    def _detect_task_type(self, instruction: str) -> str:
        instruction_lower = instruction.lower()
        for task_type, keywords in self.TASK_KEYWORDS.items():
            if any(kw in instruction_lower for kw in keywords):
                return task_type
        return 'other'
    
    def _entropy(self, counts: list) -> float:
        total = sum(counts)
        probs = [c / total for c in counts]
        return -sum(p * np.log(p + 1e-10) for p in probs)
    
    def _overall_complexity_score(self, complexities, type_counts) -> float:
        # Good dataset has: moderate complexity + diverse task types
        mean_score = np.mean([c['score'] for c in complexities])
        type_diversity = len(type_counts) / len(self.TASK_KEYWORDS)
        return 0.6 * min(mean_score, 1) + 0.4 * type_diversity
```

**Deliverable:** Working complexity metric

---

### Day 5-6: Implement Clarity Metric (5 hours)

**Concept:** Assess formatting quality using rules + LLM-as-judge

**Algorithm:**
```python
# datascore/metrics/clarity.py

import re
import google.generativeai as genai
from typing import Optional

class ClarityScorer:
    def __init__(self, api_key: Optional[str] = None, use_llm: bool = True):
        self.use_llm = use_llm and api_key is not None
        if self.use_llm:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def compute_clarity(self, data: list[dict], sample_size: int = 100) -> dict:
        """
        Assess clarity of instruction-response pairs.
        """
        # Rule-based scoring for all
        rule_scores = [self._rule_based_clarity(d) for d in data]
        
        # LLM-based scoring for sample (expensive)
        llm_scores = []
        if self.use_llm:
            sample = data[:sample_size]
            llm_scores = [self._llm_clarity(d) for d in sample]
        
        return {
            'rule_based_mean': float(np.mean([s['score'] for s in rule_scores])),
            'llm_based_mean': float(np.mean(llm_scores)) if llm_scores else None,
            'common_issues': self._aggregate_issues(rule_scores),
            'clarity_score': float(np.mean([s['score'] for s in rule_scores]))
        }
    
    def _rule_based_clarity(self, item: dict) -> dict:
        instruction = item.get('instruction', '')
        response = item.get('response', '')
        
        issues = []
        score = 1.0
        
        # Check instruction
        if len(instruction.strip()) < 10:
            issues.append('instruction_too_short')
            score -= 0.3
        if instruction.isupper():
            issues.append('instruction_all_caps')
            score -= 0.1
        if not instruction.strip().endswith(('?', '.', '!', ':')):
            issues.append('instruction_no_punctuation')
            score -= 0.1
        
        # Check response
        if len(response.strip()) < 10:
            issues.append('response_too_short')
            score -= 0.3
        if response.strip().startswith(('I ', 'As an AI')):
            issues.append('response_starts_with_I')
            score -= 0.1
        
        # Check formatting
        if '\\n\\n\\n' in response:
            issues.append('excessive_newlines')
            score -= 0.1
        
        return {'score': max(score, 0), 'issues': issues}
    
    def _llm_clarity(self, item: dict) -> float:
        prompt = f"""Rate the clarity of this instruction-response pair from 0 to 1.
        
Instruction: {item['instruction'][:500]}
Response: {item['response'][:500]}

Score (0-1):"""
        
        try:
            response = self.model.generate_content(prompt)
            score = float(re.search(r'(\d\.\d+|\d)', response.text).group(1))
            return min(max(score, 0), 1)
        except:
            return 0.5
    
    def _aggregate_issues(self, scores: list) -> dict:
        all_issues = []
        for s in scores:
            all_issues.extend(s.get('issues', []))
        return dict(Counter(all_issues).most_common(10))
```

**Deliverable:** Working clarity metric with both rule-based and LLM-based options

---

## Phase 2: Library & Aggregation (Week 2 - 25 hours)

### Day 7-8: Build Main Scorer Class (6 hours)

```python
# datascore/scorer.py

from datascore.metrics.diversity import DiversityScorer
from datascore.metrics.consistency import ConsistencyScorer
from datascore.metrics.complexity import ComplexityScorer
from datascore.metrics.clarity import ClarityScorer
from dataclasses import dataclass
import json

@dataclass
class DataScoreReport:
    diversity: dict
    consistency: dict
    complexity: dict
    clarity: dict
    overall_score: float
    per_example_scores: list
    recommendations: list

class DataScorer:
    """
    DataScore: Pre-training data quality scorer for LLM fine-tuning.
    
    Usage:
        scorer = DataScorer()
        report = scorer.evaluate("path/to/dataset.jsonl")
        print(report.overall_score)
        print(report.recommendations)
    """
    
    def __init__(
        self,
        gemini_api_key: str = None,
        weights: dict = None
    ):
        self.diversity_scorer = DiversityScorer()
        self.consistency_scorer = ConsistencyScorer()
        self.complexity_scorer = ComplexityScorer()
        self.clarity_scorer = ClarityScorer(api_key=gemini_api_key)
        
        self.weights = weights or {
            'diversity': 0.25,
            'consistency': 0.30,
            'complexity': 0.20,
            'clarity': 0.25
        }
    
    def evaluate(self, data_path: str) -> DataScoreReport:
        """
        Evaluate a fine-tuning dataset.
        
        Args:
            data_path: Path to JSONL file with 'instruction' and 'response' fields
        
        Returns:
            DataScoreReport with scores and recommendations
        """
        # Load data
        data = self._load_data(data_path)
        instructions = [d['instruction'] for d in data]
        
        # Compute metrics
        diversity = self.diversity_scorer.compute_diversity(instructions)
        consistency = self.consistency_scorer.find_contradictions(data)
        complexity = self.complexity_scorer.compute_complexity(instructions)
        clarity = self.clarity_scorer.compute_clarity(data)
        
        # Aggregate
        overall = (
            self.weights['diversity'] * diversity['diversity_score'] +
            self.weights['consistency'] * consistency['consistency_score'] +
            self.weights['complexity'] * complexity['complexity_score'] +
            self.weights['clarity'] * clarity['clarity_score']
        )
        
        # Per-example scores (simplified)
        per_example = self._compute_per_example_scores(data)
        
        # Recommendations
        recommendations = self._generate_recommendations(
            diversity, consistency, complexity, clarity
        )
        
        return DataScoreReport(
            diversity=diversity,
            consistency=consistency,
            complexity=complexity,
            clarity=clarity,
            overall_score=overall,
            per_example_scores=per_example,
            recommendations=recommendations
        )
    
    def _load_data(self, path: str) -> list:
        data = []
        with open(path, 'r') as f:
            for line in f:
                data.append(json.loads(line))
        return data
    
    def _compute_per_example_scores(self, data: list) -> list:
        # Simplified per-example scoring
        return [{'idx': i, 'score': 0.5} for i in range(len(data))]  # Placeholder
    
    def _generate_recommendations(self, div, cons, comp, clar) -> list:
        recs = []
        if div['diversity_score'] < 0.5:
            recs.append("Low diversity: Consider adding more varied instruction types")
        if cons['consistency_score'] < 0.8:
            recs.append(f"Found {cons['num_contradictions']} potential contradictions to review")
        if comp['complexity_score'] < 0.5:
            recs.append("Low complexity variance: Add more challenging instructions")
        if clar['clarity_score'] < 0.7:
            recs.append(f"Clarity issues found: {list(clar['common_issues'].keys())[:3]}")
        return recs
```

**Deliverable:** Complete DataScorer class with report generation

---

### Day 8-9: Download & Prepare Datasets (5 hours)

**Datasets to use:**

| Dataset | Size | Source | Purpose |
|---------|------|--------|---------|
| Alpaca | 52K | Stanford | Main evaluation |
| Dolly | 15K | Databricks | Cross-validation |
| OpenAssistant | 160K | LAION | Scale testing |
| WizardLM | 70K | Microsoft | Quality variance |

**Download script:**
```python
# experiments/download_datasets.py

from datasets import load_dataset
import json

def download_and_convert(name, output_path, limit=10000):
    """Download dataset and convert to standard format."""
    
    if name == 'alpaca':
        ds = load_dataset("tatsu-lab/alpaca")['train']
        data = [{'instruction': ex['instruction'], 'response': ex['output']} 
                for ex in ds.select(range(min(limit, len(ds))))]
    
    elif name == 'dolly':
        ds = load_dataset("databricks/databricks-dolly-15k")['train']
        data = [{'instruction': ex['instruction'], 'response': ex['response']}
                for ex in ds.select(range(min(limit, len(ds))))]
    
    elif name == 'openassistant':
        ds = load_dataset("OpenAssistant/oasst1")['train']
        # Filter for English, assistant messages
        data = [{'instruction': ex['text'], 'response': ''} 
                for ex in ds if ex['lang'] == 'en'][:limit]
    
    with open(output_path, 'w') as f:
        for item in data:
            f.write(json.dumps(item) + '\n')
    
    print(f"Saved {len(data)} examples to {output_path}")

if __name__ == '__main__':
    download_and_convert('alpaca', 'data/alpaca.jsonl')
    download_and_convert('dolly', 'data/dolly.jsonl')
```

**Deliverable:** Downloaded datasets in standardized JSONL format

---

### Day 9-10: Score All Datasets (6 hours)

**Scoring script:**
```python
# experiments/score_datasets.py

from datascore import DataScorer
import json

def score_all_datasets():
    scorer = DataScorer()
    datasets = ['alpaca', 'dolly', 'wizardlm', 'openassistant']
    
    results = {}
    for name in datasets:
        print(f"Scoring {name}...")
        report = scorer.evaluate(f'data/{name}.jsonl')
        results[name] = {
            'overall': report.overall_score,
            'diversity': report.diversity['diversity_score'],
            'consistency': report.consistency['consistency_score'],
            'complexity': report.complexity['complexity_score'],
            'clarity': report.clarity['clarity_score'],
        }
        print(f"  Overall: {report.overall_score:.3f}")
    
    with open('results/dataset_scores.json', 'w') as f:
        json.dump(results, f, indent=2)

if __name__ == '__main__':
    score_all_datasets()
```

**Deliverable:** DataScore values for all datasets

---

### Day 10-11: Create Subset Splits (4 hours)

**Create high/low quality subsets based on per-example scores:**

```python
# experiments/create_splits.py

def create_quality_splits(dataset_path: str, scores: list, output_dir: str):
    """
    Split dataset into high/medium/low quality subsets.
    """
    # Sort by score
    indexed_scores = [(i, s) for i, s in enumerate(scores)]
    indexed_scores.sort(key=lambda x: x[1], reverse=True)
    
    n = len(indexed_scores)
    high_idx = [x[0] for x in indexed_scores[:n//3]]
    low_idx = [x[0] for x in indexed_scores[-n//3:]]
    
    # Load original data
    with open(dataset_path) as f:
        data = [json.loads(line) for line in f]
    
    # Save splits
    with open(f'{output_dir}/high_quality.jsonl', 'w') as f:
        for i in high_idx:
            f.write(json.dumps(data[i]) + '\n')
    
    with open(f'{output_dir}/low_quality.jsonl', 'w') as f:
        for i in low_idx:
            f.write(json.dumps(data[i]) + '\n')
```

**Deliverable:** High/low quality splits for each dataset

---

### Day 11-12: Package as Library (4 hours)

```python
# setup.py

from setuptools import setup, find_packages

setup(
    name="datascore",
    version="0.1.0",
    description="Pre-training data quality scorer for LLM fine-tuning",
    author="Your Name",
    packages=find_packages(),
    install_requires=[
        "sentence-transformers>=2.2.0",
        "scikit-learn>=1.0.0",
        "numpy>=1.21.0",
        "pandas>=1.3.0",
    ],
    extras_require={
        "llm": ["google-generativeai>=0.3.0"],
    },
    python_requires=">=3.8",
)
```

**Deliverable:** Pip-installable package

---

## Phase 3: Validation Experiments (Week 3 - 25 hours)

### Day 13-15: Fine-Tuning Experiments on Kaggle (15 hours)

**Experiment Design:**

For each dataset (Alpaca, Dolly):
1. Score all examples with DataScore
2. Create "high quality" (top 33%) and "low quality" (bottom 33%) subsets
3. Fine-tune same base model on each subset
4. Evaluate on benchmark tasks
5. Compute correlation: DataScore ↔ Model Performance

**Fine-tuning script (for Kaggle):**
```python
# experiments/finetune_validation.py
# Run on Kaggle with free GPU

from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from trl import SFTTrainer
from datasets import Dataset

def finetune_on_subset(
    subset_path: str,
    model_name: str = "microsoft/phi-2",  # Small, fits in 16GB
    output_dir: str = "outputs/",
    max_steps: int = 500
):
    """Fine-tune a small LLM on a data subset."""
    
    # Load model
    model = AutoModelForCausalLM.from_pretrained(model_name, trust_remote_code=True)
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    # Load data
    with open(subset_path) as f:
        data = [json.loads(line) for line in f]
    
    # Format for training
    def format_prompt(example):
        return f"Instruction: {example['instruction']}\nResponse: {example['response']}"
    
    dataset = Dataset.from_list(data)
    
    # Training args
    args = TrainingArguments(
        output_dir=output_dir,
        max_steps=max_steps,
        per_device_train_batch_size=4,
        gradient_accumulation_steps=4,
        learning_rate=2e-5,
        logging_steps=50,
        save_steps=500,
    )
    
    # Train
    trainer = SFTTrainer(
        model=model,
        train_dataset=dataset,
        tokenizer=tokenizer,
        args=args,
        formatting_func=format_prompt,
    )
    trainer.train()
    
    return trainer

# Run for high/low quality subsets
finetune_on_subset('data/alpaca_high.jsonl', output_dir='outputs/alpaca_high')
finetune_on_subset('data/alpaca_low.jsonl', output_dir='outputs/alpaca_low')
```

**Evaluation:**
```python
# experiments/evaluate_models.py

from lm_eval import evaluator

def evaluate_model(model_path: str):
    """Evaluate fine-tuned model on benchmarks."""
    results = evaluator.simple_evaluate(
        model="hf",
        model_args=f"pretrained={model_path}",
        tasks=["hellaswag", "arc_easy", "truthfulqa_mc"],
        batch_size=8,
    )
    return results['results']
```

**Deliverable:** Model performance for high vs low quality subsets

---

### Day 15-17: Correlation Analysis (6 hours)

```python
# experiments/correlation.py

import scipy.stats as stats
import numpy as np

def compute_correlations(dataset_scores: dict, model_performances: dict):
    """
    Compute correlation between DataScore and model performance.
    """
    # Collect pairs
    scores = []
    perfs = []
    
    for dataset, ds_score in dataset_scores.items():
        for quality in ['high', 'low']:
            subset_key = f"{dataset}_{quality}"
            if subset_key in model_performances:
                scores.append(ds_score if quality == 'high' else 1 - ds_score)
                perfs.append(model_performances[subset_key]['accuracy'])
    
    # Compute correlations
    pearson_r, pearson_p = stats.pearsonr(scores, perfs)
    spearman_r, spearman_p = stats.spearmanr(scores, perfs)
    
    return {
        'pearson_r': pearson_r,
        'pearson_p': pearson_p,
        'spearman_r': spearman_r,
        'spearman_p': spearman_p,
    }
```

**Target result:** r > 0.80 correlation (validates predictive claim)

**Deliverable:** Correlation statistics + plots

---

### Day 17-18: Ablation Studies (4 hours)

**Ablations to run:**

1. **Individual metric importance:** Remove each metric, recompute correlation
2. **Weight sensitivity:** Vary metric weights, measure stability
3. **Sample size:** How many examples needed for reliable scoring?

**Deliverable:** Ablation results table

---

## Phase 4: Paper & Release (Week 4 - 25 hours)

### Day 19-21: Write Paper (12 hours)

**Paper Structure:**

```
1. Abstract (200 words)
   - Problem: No tools for pre-training data quality
   - Solution: DataScore framework
   - Results: r=0.85 correlation with model performance
   - Impact: Enables targeted data curation

2. Introduction (1 page)
   - Data quality matters for LLM fine-tuning
   - Gap: Existing tools evaluate outputs, not inputs
   - Contribution: First predictive data quality framework

3. Related Work (0.5 page)
   - Data-centric AI
   - LLM evaluation (DeepEval, RAGAS)
   - Data quality in ML

4. DataScore Framework (2 pages)
   - Metrics: Diversity, Consistency, Complexity, Clarity
   - Aggregation method
   - Per-example scoring

5. Experiments (2 pages)
   - Setup: Datasets, models, evaluation
   - Main result: Correlation with performance
   - Ablations: Which metrics matter most

6. Discussion (0.5 page)
   - Limitations
   - Future work

7. Conclusion (0.25 page)
```

**Deliverable:** Complete paper draft (6-8 pages)

---

### Day 21-22: Create Visualizations (4 hours)

**Figures to create:**

1. **Figure 1:** DataScore framework overview (architecture diagram)
2. **Figure 2:** Correlation scatter plot (DataScore vs Performance)
3. **Figure 3:** Per-metric scores across datasets (bar chart)
4. **Figure 4:** Ablation results (heatmap)

**Deliverable:** Publication-ready figures

---

### Day 22-23: Finalize Library & Documentation (5 hours)

**Documentation:**
```markdown
# DataScore

Pre-training data quality scorer for LLM fine-tuning.

## Installation

```bash
pip install datascore
```

## Quick Start

```python
from datascore import DataScorer

scorer = DataScorer()
report = scorer.evaluate("my_dataset.jsonl")

print(f"Overall Score: {report.overall_score}")
print(f"Recommendations: {report.recommendations}")
```

## API Reference
...
```

**Deliverable:** GitHub repo with README, docs, examples

---

### Day 23-24: Submission Prep (4 hours)

**Target venues:**
1. **Primary:** Data-Centric AI Workshop @ NeurIPS 2026 (deadline ~Sep 2026)
2. **Backup:** DEEM @ SIGMOD 2027 (deadline ~Dec 2026)
3. **Backup:** AAAI 2027 (deadline ~Aug 2026)

**Submission checklist:**
- [ ] Format paper for venue (LaTeX template)
- [ ] Anonymous submission (remove author info)
- [ ] Supplementary materials (code link)
- [ ] CMT/OpenReview account

**Deliverable:** Submission-ready paper + code

---

## Summary: 100-Hour Timeline

| Week | Phase | Hours | Key Deliverables |
|------|-------|-------|------------------|
| 1 | Foundation | 25h | 4 core metrics implemented |
| 2 | Library | 25h | DataScorer class, datasets, package |
| 3 | Validation | 25h | Fine-tuning experiments, correlation |
| 4 | Paper | 25h | Paper draft, figures, submission |

---

## Success Criteria

| Metric | Target | Validation |
|--------|--------|------------|
| **Correlation** | r > 0.80 | Pearson/Spearman with model performance |
| **Library** | 100+ installs | PyPI stats |
| **Acceptance** | Workshop acceptance | 45-60% probability |
| **Novelty** | First of its kind | No competing pip package |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| **Low correlation** | Adjust metric weights, add new metrics |
| **Kaggle GPU limits** | Use smaller models (TinyLlama), fewer steps |
| **Paper rejected** | Submit to backup venues |
| **Similar concurrent work** | Emphasize unique angles (actionable, library) |
