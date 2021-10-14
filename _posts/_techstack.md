---
title: 'Techstack'
article: false
excerpt: "Socialbakers is a trusted social media marketing partner to thousands of enterprise brands and SMBs, including over 100 companies on the list of Fortune Global 500. Leveraging the largest social media data-set in the industry and machine learning, Socialbakers’ marketing suite of solutions helps brands ensure their investment in social media is delivering measurable business outcomes."
coverImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=300&q=80'
date: '2020-01-01'
author:
  name: Pavel Sládek
  picture: '/assets/blog/authors/paja.jpeg'
ogImage:
  url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=300&q=80'
---

## What does your tech-stack look like?

![](https://coda.io/contentProxy/RpOYzmZ4s3/blobs/bl-jQ8vdQcBMA/eb2257b09d60cc0676be51585aa587fb16a72cb832bce8afac7cdcc1bbe9c0d80aee768ec2a7d146e1282e2963145532d7f16742138893763396f0d40d03bef58f3815d3166f294b69aeeb8f5e2cb51a86574a9682506060d59e5d33afcd80e99b63d400)
check out this diagram!

## Frontend is React-based, right?
  * exactly! We have React-based stack with common libraries such as Redux and Redux-Saga. Everything gets validated by our linter and unit tests
## No PHP?
  * that’s right! We have a few legacy services written in PHP but they are to disappear very soon!
## What about GraphQL?
  * so far we haven’t had a need for introducing GraphQL
## Do you use static typing?
  * only somewhere on the frontend part where it makes sense. We use Flow and migration to TypeScript is already ahead
## What databases do you use?
  * our DB stack is vast! From PostgreSQL over DynamoDB up to Elastic and Redis
  * if we are good at something, it's definitely the Elastic! We use it heavily
## And the tests?
  * testing is imperative to us. We write end-to-end Selenium tests, unit and integration tests. Even QA engineers write integration tests on their own
  * concerning code coverage, we don’t go for 100% coverage as we can’t see any benefit of taking this path
## How do you manage global changes in your architecture?
  * introducing changes gradually is our goal. Each repository has got their own contributors who take care of keeping the npm packages up-to-date
  * concerning introduction of brand-new technologies, every decision is thoughtfully discussed – we go the way of evolution, not revolution. Every decision will have a long-term impact on our codebase. Thus, we have to be mindful of the future many years ahead.
## Is there any scientific approach involved in your flow?
  * we have our own department of machine-learning specialists
## How do you deal with unexpected critical situations?
  * first of all, prevention is better than a cure. We do drills, discussing possible ways of how to break our system and trying it out in the dev environment
  * for everything else, we have monitoring tools, Slack notifications and on-duty people
## Do you maintain documentation?
  * absolutely! It’s also involved in our onboarding process to help new hires get on track. Every repository has got their own documentation and for everything else we have our amazing wiki. We expect regular contribution from everybody to improve things gradually. In addition to that, we try to keep the scope to a minimum, maintaining only the most important information necessary.
## How do you handle refactoring?
  * refactoring is a part of regular job, you are always supposed to leave code in better state than before 
  * on top of that we have NPDD (non-product-development days) where we have opportunity to work on more complex technical debt. Taking care of technical debt, as well as giving the engineers time for other things such as knowledge-sharing and experimenting is very important to us.