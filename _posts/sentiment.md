---
title: 'Sentiment Analysis at Socialbakers'
article: true
excerpt: "Our Innovations team at Socialbakers was working on a very interesting task last year, sentiment analysis for social media. In the context of our work, sentiment analysis is an automated process of text analysis leading to a prediction of how an audience feels towards any given subject from texts of social media messages."
coverImage: 'https://images.unsplash.com/photo-1508280756091-9bdd7ef1f463?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=620&q=80'
date: '2020-03-23'
author:
  name: Jan Rus
  picture: '/assets/blog/authors/rus.jpg'
ogImage:
  url: 'https://images.unsplash.com/photo-1508280756091-9bdd7ef1f463?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=700&q=80'
---

# Sentiment Analysis at Socialbakers

Our Innovations team at Socialbakers was working on a very interesting task last year, sentiment analysis for social media. In the context of our work, sentiment analysis is an automated process of text analysis leading to a prediction of how an audience feels towards any given subject from texts of social media messages.

The result of this process is a *classification* of the texts into 3 classes: positive, neutral and negative.

Such text analysis can be rented as a service these days, but our goal was a system that can analyze 150,000,000 messages in 5–10 different languages every day. We researched this option and found out that it would be an extremely expensive service to rent even from the cheapest providers on the market in 2019.

Moreover, most text analysis tools and services are not fine-tuned to social media and don’t support all languages we are interested in such as Czech or Arabic.

So, we decided to build the solution in-house. We shared the architecture of our deep learning solution (recurrent neural network) and the necessary theoretical background in the previous post: [Theoretical Introduction and Architecture](https://medium.com/socialbakers-engineering/sentiment-analysis-at-socialbakers-ca10f567eed9)¹.

But as we wrote at the end of the blog post, we think that the largest building block of any successful deep learning project is the data. If the neural network is a student then the dataset is a textbook.

## Data for Deep Learning POC

In the case of courses, trainings or competitions deep learning practitioners often start their work with given training and test datasets. They can invest their effort into algorithms and tuning of their parameters from the very beginning.
> **In practice, the work starts with getting the dataset first.**

Ideally, research teams can find an open-source dataset that is large, high quality and matches the goal (including domain) of the deep learning project but it is a very rare situation. The research teams usually have three options: 1) to build the perfect manually annotated dataset from scratch in-house which is an expensive and time-consuming process, 2) to find and combine the right but smaller datasets from different sources with lower and varying quality that at least partially overlap with the goal of the project or 3) to find a way how to create a dataset with labels derived from a different but related information. The 2) and 3) may lead to larger but noisy datasets or even a necessity of *transfer learning*².

### The First Dataset

After initial research, we realized that it will be hard to find publicly available datasets with texts and sentiment labels that would fit our needs. Datasets we found were:

* **small**, having only 500–1,000 samples is currently unsuitable for such deep learning project,

* **using only 2 classes** (positive and negative), while we need 3 classes,

* **from a different domain**, for example, long movie reviews,

* **having wrong properties** such as too long texts missing slang or emojis,

* **licensed** in a way that prevents us from using them even for experiments.

Simply, nothing close to a large dataset of short social media messages in a number of different languages and sentiment labels with 3 classes. We, therefore, started to evaluate the more laborious options:

* **Amazon Mechanical Turk**: unnecessarily expensive and without decent control over the quality of the annotations. We would need multiple annotations per text to keep the quality high and so we estimated the cost to at least $15,000 just for the English training set of 200,000–300,000 texts annotated by 3–5 annotators.

* **Client sentiment labels**: it is possible to label sentiment in our Socialbakers Suite manually, so we have a large number of such labels in our databases. Here, we worried (and experimentally confirmed) the quality of annotations would suffer as well because the clients are not trained to do the job, they are also biased and they also use the labels for different purposes in some cases.

* **Customer product reviews**: these datasets are mostly pairs of textual reviews and up to 5 stars assigned to the reviewed product, for example, *Amazon reviews*³. The number of stars can be used as a noisy sentiment label (the more starts the more positive sentiment). We researched a few such datasets and concluded that a) the number of stars doesn’t correlate well with the sentiment of the textual review and b) a customer review sentiment is different from the common conversation sentiment. Consider that the typical “positive” phrases in these datasets are phrases like *low price*, *quick delivery* or *100% leather*. The last argument against such datasets is that they are mostly not available for commercial use.

We experimented with even more options that didn't work for us at the end, but the last option in the list above was closest to our idea of how we may get the first data for our deep learning proof of concept.

We intended to use a widespread noisy (not always correct) labels that could be quickly and automatically gathered on a large scale and correlated with the sentiment in the related texts.

Social media messages are full of emojis and we decided to use the emojis as the noisy automatically gathered sentiment labels. We focused on English first, because it is a very frequent language with a higher chance to find some available datasets and competitive algorithms for benchmarking. But in general, this approach would enable us to build datasets for any language.

Our approach was to download a sample of Facebook messages written in English (we used PyCLD⁴ for language detection) and for each message:

* extract all emojis,

* map each emoji to a sentiment class,

* use the most frequent sentiment class as a label for the original message.

If there was no emoji found in the message or if there wasn’t a single most frequent sentiment class assigned to the emojis (e.g. the same amount of positive and neutral emojis appeared in the message), the message was removed from the dataset, see example in image 1 below.

![Image 1: Mapping emojis to sentiment label.](https://cdn-images-1.medium.com/max/2800/1*694QNpje5ySrvdMwqspIQg.png)*Image 1: Mapping emojis to sentiment label.*

The mapping between emojis and sentiment was made in-house but it is a very small amount of work in comparison to the manual annotation of all the downloaded messages. With this approach, we quickly prepared a balanced dataset of 38,000 social media messages written in English. This was our source for the first training and validation datasets.

Next, we created a small balanced dataset consisting of 500 Facebook messages (not all of them contained emojis) which were labeled manually by our Innovations team. This was our first test dataset. The reason to choose this approach was that we knew that we are not able to build a large
hand-labeled dataset in a short time but we are able to quickly build at least a test set this way and have a well-defined target to aim on.

*The messages we use in this project are publicly available user comments provided by Facebook and other social networks via their APIs. They are anonymized.*

### Performance Benchmark

To be able to measure our progress during the project, we needed to set up an accuracy benchmark. We had no KPIs in place at this phase but we used a well-known sentiment analysis library called *VADER*⁵ as a benchmark. The VADER is a very lightweight model based on the valence lexicon and a set of linguistic rules, it was the cheapest solution and also the fastest to deliver we were aware of. A tempting solution for quick prototyping in the commercial sphere. The only (and significant) drawback is the dictionary itself that exists only for English and we would need an expert in linguistics to be able to extend it to other languages. We wanted to overcome this drawback and prove that a machine learning solution will be not just easier to extend and maintain but also better performing on our use case. Overall, a better approach in the long term. The VADER became the lower threshold for the benchmark.

Next, we chose the *inter-annotator agreement*⁶ to be the upper threshold for the benchmark. If you ask a group of people to label the sentiment of the given set of texts, you will find out that there will be some examples where they will not agree on the sentiment, i.e. they will not agree in 100% cases. It would be therefore naive to expect that a machine learning algorithm would achieve better results. It has been experimentally proven that the typical inter-annotator agreement in sentiment analysis is approximately 80%⁶. This means that if an algorithm reaches 80% accuracy, it has approximately a human-level performance.

Last, we picked 2 services (APIs) providing sentiment analysis as a reference: *MeaningCloud* and *Amazon Comprehend*. We analyzed the first test set with these two services and the VADER, measured their accuracy and constructed the benchmark. See chart 1 below.

![Chart 1: Accuracy benchmark for our POC.](https://cdn-images-1.medium.com/max/3500/1*KSsfkGY8mDX6u7bzG6agig.png)*Chart 1: Accuracy benchmark for our POC.*

### The First Experiment

During the first series of experiments, we tuned, trained and validated our neural network on the dataset of 38,000 emoji-labeled Facebook messages. Then, we run a test against the 500 Facebook messages labeled by our Innovations team.
> **We failed really badly.**

We achieved accuracy better than random (which is 33%) but much worse than VADER which we intended to beat, see the accuracy measurements in table 1 below.

![Table 1: Accuracy measurements for a model trained on the emoji-labeled dataset.](https://cdn-images-1.medium.com/max/3600/1*-tLcxEP6XR68LUF9muDvrg.png)*Table 1: Accuracy measurements for a model trained on the emoji-labeled dataset.*

We suspected the problem is in the training dataset immediately. VADER was working worse on the emoji-labeled dataset than on the manually labeled dataset. On the other hand, the neural network learned to work quite well on the emoji-labeled dataset and then totally failed on the manually labeled dataset. So the neural network can learn to predict emojis from a text but it doesn’t help it to predict sentiment from a text. It’s not that surprising in retrospective.

In contrast to for example stars and customer reviews, the emojis are an integral part of the messages. If we remove the emojis from the text and use them as a sentiment label, we may completely change the meaning of the message (especially if it’s a short message) and build a very noisy labeled dataset. If we keep the emoji in the message, the network will likely learn to predict the sentiment mostly based on the emojis (remember the 96% accuracy on the validation set above). We experimented with both but the results on the test dataset were more or less the same.

### The Second Dataset and Experiment

Due to the tight time constraints and lessons taught during the previous experiments, we avoided using any hints to a sentiment of a text hidden in the text itself (emojis, hashtags, etc.) in the future and built the next dataset with real sentiment labels exploiting VADER and two more third-party services. We managed to do this practically at no cost. We kept only the messages where the sentiment analysis algorithms agreed as sufficiently reliable for our training set (approximately 80% of cases). This way we obtained a balanced dataset of 147,000 English social media messages with sentiment labels.

We repeated the previous experiment with training and validating on one dataset and testing on the manually labeled dataset and we finally succeeded, see table 2 below.

![Table 2: Accuracy measurements for a model trained on the automatically-labeled dataset.](https://cdn-images-1.medium.com/max/3600/1*pcnkVcSvsFblrY1Bl5UBCw.png)*Table 2: Accuracy measurements for a model trained on the automatically-labeled dataset.*

The results may be a bit misleading because the test set is very small (only 500 messages) and the training/validation set is probably not very challenging (a subset of the original dataset where multiple algorithms agreed) but it was a good signal and reliable enough to get support from the Product Management team. Until now, it was just a proof of concept created by 2 team members in 3 weeks in parallel with other higher-priority projects.

## In-house Sentiment Dataset

After a discussion of the results with the stakeholders, we decided to continue in the project, to invest effort into building the infrastructure and further experiments with our own machine learning solution. We also agreed that we can start cooperating with our internal tagging team on building a manually labeled dataset for this sentiment analysis project. The Taggers proved to be a tremendous help on many occasions since then. In the beginning, we wanted to use the created dataset only as a test set. But with a larger volume of data, we could start to mix a fraction of the dataset into training and validation sets and ideally end up with a dataset large enough to train, validate and test our models only on this dataset itself.

### Crash Course for Annotators

The Taggers team underwent a crash course on the sentiment analysis and how to label the datasets. Then, we selected 5 of them, asked them to label a set of approximately 400 texts and calculated their inter-annotator agreement. They reached almost 90% agreement which is higher than the claimed typical inter-annotator agreement (80%) but it’s likely due to the fact that the Taggers are trained and they are trained to work as a team (a single annotator). Such a high agreement encouraged us to let the team to label each text of the target dataset by only one annotator (typically multiple untrained annotators label every single text to achieve a higher quality of the labels) and progress faster to the first milestone that was set to 100,000 labeled English Facebook messages.

Once the team produced a dataset of 15,000 labeled texts, we proceeded to a test of alignment to be able to identify and fix eventual small discrepancies in time. We used the previously trained model and predicted sentiment for the original small dataset of 500 Facebook messages labeled by our Innovations team. Next, we used the same model to predict the sentiment for the larger new (unbalanced) dataset of 15,000 Facebook messages labeled by the team of annotators and compared the achieved accuracies.
> **We failed badly again.**

We expected the accuracy will change with a larger and more robust test dataset but we didn’t expect it to drop by 14%, from 75% to **61%** failing to beat the VADER again.

### What is Sentiment

Such a suspiciously big drop in performance motivated us to start researching the cause immediately. Luckily, we monitored which annotator labeled which text. We filtered the messages where labels created by the Taggers team were different from predictions of the model and looked for outliers: taggers with a significantly worse agreement with the model than others. We didn’t find them. Not just the amount, but also the distribution of positive, neutral and negative labels were similar for all annotators. It looked like a systematic error. The team of annotators (true labels) tends to a wider range of what is neutral than the model (predictions), see chart 2 below.

![Chart 2: Distribution of true labels and predictions with the old labeling manual.](https://cdn-images-1.medium.com/max/3504/1*vIlZcPrba6NpegxFYGHTfA.png)*Chart 2: Distribution of true labels and predictions with the old labeling manual.*

We decided to relabel a small subset of these different messages only in the Innovations team and we inclined (also systematically) to the results of the model, not the Taggers team. In fact, it was good news. Systematic errors are easier to uncover, understand and fix than random errors.

We organized another training session with the Taggers team, shared our findings and followed with a discussion about the possible cause of the systematic discrepancy between labels provided by the Innovations team, the model and the Taggers team. The outcome was quite surprising. **Their high-level understanding of what is sentiment was different from ours.** They understood sentiment as to **how an author feels** when writing the given text, for us it was **how a reader feels** when reading the given text.

![Image 2: This sample text was labeled as neutral by Taggers because it’s an ad (the author feels neutral) and positive by Innovations because we had a positive feeling while reading the text.](https://cdn-images-1.medium.com/max/2800/1*8Y3oRTsrW68yNbgilfGi5g.png)*Image 2: This sample text was labeled as neutral by Taggers because it’s an ad (the author feels neutral) and positive by Innovations because we had a positive feeling while reading the text.*

It’s a crucial principle yet something we didn’t think of before and didn’t cover with examples in the labeling manual. What the Taggers did wasn’t wrong. It was an interesting finding, another point of view and we needed to know which one is the right one. We prepared a questionnaire with a description of sentiment analysis, the issue we were facing and a set of 20 examples of texts with questionable sentiment labels. This document was shared with selected Socialbakers employees and clients and collected feedback uncovered that the **how a reader feels** point of view is the more desirable one. We updated the labeling manual with this enlightening discovery, ask Taggers to relabel affected part of the manually labeled dataset and then continue in pursuing the 100,000 dataset milestone.

Shortly thereafter, when the Taggers team reached 20,000 manually labeled texts, we repeated the alignment test and were happy with the result. You can see in the chart 3 below that the distribution of the predicted and labeled sentiment became better defined, the positive and negative classes were rarely confused with the neutral class and the (balanced and unbalanced) accuracy achieved by the model on this dataset raised to 77%.

![Chart 3: Distribution of true labels and predictions with the new labeling manual.](https://cdn-images-1.medium.com/max/3504/1*bvLzgUCc7_UN5_rZJiGUEQ.png)*Chart 3: Distribution of true labels and predictions with the new labeling manual.*

With the growing and more robust test set, the accuracy of our solution slowly dropped to 70% after some time. We kept searching for and experimenting with new sources of sentiment labels and mixing them together to counter fight the drop in the performance. But once the team of annotators reached another milestone of 200,000 labeled messages, we started to use this dataset for training and validation as well and pushed the performance of our sentiment analysis model even further.

## Summary

You can see that it is not a straightforward task to build a dataset for a machine learning project. Even for businesses. But having the (bug-fixed) labeling manual, a trained team of annotators and a large amount of data from the right domain allowed us to build a large high-quality dataset of English social media messages with sentiment labels.

This is the end of this episode. This is where many machine learning projects just begin.

Sounds interesting? Check out more of our [stories](https://medium.com/socialbakers-engineering) & don’t forget [we’re hiring](https://www.socialbakers.com/careers?utm_source=mediumblog&utm_medium=.&utm_campaign=Sentiment_Analysis_2)!

## Notes and References

[1]: Sentiment Analysis: Theoretical introduction and Architecture
[https://medium.com/socialbakers-engineering/sentiment-analysis-at-socialbakers-ca10f567eed9](https://medium.com/socialbakers-engineering/sentiment-analysis-at-socialbakers-ca10f567eed9)

[2]: Transfer learning, exploiting a knowledge gained while solving a different but related problem, see a brief description here:
[https://en.wikipedia.org/wiki/Transfer_learning](https://en.wikipedia.org/wiki/Transfer_learning)

[3]: Amazon Customer Reviews dataset
[https://s3.amazonaws.com/amazon-reviews-pds/readme.html](https://s3.amazonaws.com/amazon-reviews-pds/readme.html)

[4]: PyCLD, Python bindings for the Compact Language Detect 2
[https://github.com/aboSamoor/pycld2](https://github.com/aboSamoor/pycld2)

[5]: VADER, a lexicon and rule-based sentiment analysis tool
[https://github.com/cjhutto/vaderSentiment](https://github.com/cjhutto/vaderSentiment)

[6]: How Companies Can Use Sentiment Analysis to Improve Their …, 2012
[https://mashable.com/2010/04/19/sentiment-analysis](https://mashable.com/2010/04/19/sentiment-analysis)
