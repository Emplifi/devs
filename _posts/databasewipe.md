---
title: 'Wiping production database in one command'
article: true
excerpt: "This article is about something you really don't want to happen. Ever. To delete all current transactional data about your customers and accounts they are members of. This fuck-up actually happened to me some years ago and now I'm going to explain the reasons behind that."
coverImage: 'https://images.unsplash.com/photo-1533750204176-3b0d38e9ac1e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=700&q=80'
date: '2019-11-11'
author:
  name: Martin Bydžovský
  picture: '/assets/blog/authors/bydza.png'
ogImage:
  url: 'https://images.unsplash.com/photo-1533750204176-3b0d38e9ac1e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&h=700&q=80'
---


# Wiping production database in one command

This article is about something you really don't want to happen. Ever. To delete all current transactional data about your customers and accounts they are members of. This fuck-up actually happened to me some years ago and now I'm going to explain the reasons behind that.

## Microservices everywhere

As you probably know, at Socialbakers we use a [microservice architecture](https://medium.com/socialbakers-engineering/distributed-api-platform-87271f689539). Each service usually consists of a couple of API endpoints and its own database where it stores this service's related data. Now we are talking about a microservice that acts as the main source of all accounts, users and their logins. Code is (typically for us) Node.js and stores its in data Postgres SQL (RDS = Amazon provided and managed database).

However, this service had only one (= production) environment. There were, of course, 3 codebases (dev/staging/prod) running as separated instances, plus dev and staging were accessible only behind the VPN, but they all operated on the same dataset. We knew it wasn't the smartest idea, but there were some arguments against choosing another option:

* No one wanted to use different passwords for different environments — it caused confusions, mainly between non-tech people.

* Because of historical reasons we already had a solution to “sandbox” the dev/staging/prod data inside the microservice itself. So you couldn't query “dev data” from the production instance and vice versa. But again — the database was the same, it was sandboxed only in the application logic.

* Status quo — almost none development was made to this microservice so no one was pushing to invest time and money to improve it.

## Calm before the storm

I was doing a routine import/migration of some account-related data from another datasource into this main account-user microservice. The migration consisted of three steps:

* Create a new simple lookup table and add column to the existing account table with foreign key:

    CREATE TABLE account_type (id SERIAL PRIMARY, type TEXT);
    ALTER TABLE account ADD COLUMN type INT REFERENCES account_type(id);

* Fill the *account_type* table with data — this wasn't just SQL query, it was a one-purpose script going through multiple data sources, processing the data and filling the lookup table.

* Finally, crawl some more sources and fill in the newly created *account_type* column (which consists of only NULLs for now) in the *account* table.

Doesn't seem like a big deal, backwards compatible change, backend doesn't query for all columns (no SELECT * FROM … query), so no API endpoints would get magically enriched by that newly stored data. Easy peasy lemon squeezy, what could go wrong?

The first part ran smoothly, alters finished without any problems. Then I ran the lookup-table-fill script. It finished and filled the data, however they were somehow not formatted properly and some of them had corrupted names. I fixed the script and wanted to empty the table and re-run the script again.

## Not great not terrible

Only God knows why I decided to use ***TRUNCATE*** instead of ***DELETE FROM***. So when I did it, psql told me:

    db=> truncate table account_type;
    ERROR: cannot truncate a table referenced in a foreign key constraint
    DETAIL: Table “account” references “account_type”.
    HINT:  Truncate table "account" at the same time, or use TRUNCATE ... CASCADE.

I should have read better what exactly was the hint telling me. This was the moment I should have stopped and reconsidered everything. However, I knew there were exactly zero related records in the two tables (which was really true) so I didn't think twice, just appended ***CASCADE*** keyword at the end of the query and hit enter.

I still assumed: no relations, so nothing can get connected and cascade to the reset of the tables. How wrong I was. Oh, how wrong.

![](https://cdn-images-1.medium.com/max/2000/1*wGP-lwNQ1qW6XHedjmfSTA.png)

    db=> truncate table account_type CASCADE;
    NOTICE: truncate cascades to table “account”
    NOTICE: truncate cascades to table “user_in_account”
    NOTICE: truncate cascades to table “user”
    NOTICE: truncate cascades to table ”user_identity”
    ...
    TRUNCATE TABLE

Once I saw these notices, I realized things were getting pretty serious…

<center><iframe width="560" height="315" src="https://www.youtube.com/embed/wuIpX6m5W3w" frameborder="0" allowfullscreen></iframe></center>

It took me just a few seconds to confirm that the tables were really empty and all users are getting logged out without any way to log back in (the product polls information about current user from time to time). This of course applies to all current trial users, paying customers, enterprise customers, and our internal employees.

## ***Resurrection***

We immediately started DB restore procedure. In RDS you have a window period once a day where Amazon creates a full DB snapshot. Between those windows, you can do a so-called ***Point-in-time Restore ***which allows you to target any time during the day.

The latest available time we could choose was 7mins old. In the meantime, RDS gives you a connstring to the new DB that’s being created. Once we had it, we prebuilt the microservice (we use docker and heroku-style buildpacks — will cover this topic later) with updated connstring so the service could be re-launched immediately as the DB went online.

    13:52 - truncate cascade
    13:54 - DB snapshot recovery started
    14:06 - restored DB up and running
    14:07 - microservice redeployed with new connstring

Despite the fact I erased practically the whole database, we were able to get back to operational mode in exactly fifteen minutes.

## What Happened

I didn't realize the major difference between the truncate and delete commands. So a simple ***DELETE FROM*** account_table would do exactly what I intended: check for FK constraints, find out there's nothing connected and empty the table. However this doesn't apply for TRUNCATE. Looking into the docs, the description states:
> TRUNCATE quickly removes all rows from a set of tables. It has the same effect as an unqualified DELETE on each table but, since it does not actually scan the tables, it is faster.

It sounds cool, however the “speed” has a significant tradeoff — as you learn when you continue reading the additional notes:
> TRUNCATE cannot be used on a table that has foreign-key references from other tables, unless all such tables are also truncated in the same command. Checking validity in such cases would require table scans, and the whole point is not to do one. The CASCADE option can be used to automatically include all dependent tables — but be very careful when using this option, or else you might lose data you did not intend to!

Ba-Dum Tsssssss!

## **Lessons learned**

Obviously no one was happy about this accident. Completely breaking your product for 15 minutes is something you don't want to do — and it's not easy to explain to your managers either.

![](https://cdn-images-1.medium.com/max/2416/1*aHiKbPFWX9Hzt2W26xNzRA.png)

However at the end of the day, the outcomes were mostly positive.

1. We didn't have to discuss whether we need separate databases for each environment or not. Suddenly it became a priority number one!

1. It turned out to be a successful production failover test. You never know when your DB will crash because of HW/hypervisor or whatever issue. Now we know we can get back online from a backup in a given time period.

1. Personal experience — never ever use ***TRUNCATE CASCADE*** on production. Maybe when you just want to… NO! NEVER!
