---
title: "SQLite Pitfalls"
date: 2024-11-10T10:20:42+01:00
tags: ["sql", "sqlite"]
draft: false
---

## Intro

SQLite is the world’s  [most widely](https://www.sqlite.org/mostdeployed.html) used database, powering the backends of countless applications. For most software, it offers a reliable solution for embedded data storage, eliminating the need to reinvent the wheel. Its broad adoption means developers benefit from a well-documented, dependable tool with a familiar SQL dialect.

<!--more-->

Recent interest in SQLite has surged, particularly due to its fit for two key technological trends. First, it’s a strong choice for multi-tenant architectures, where platforms like Turso leverage SQLite to give each tenant an isolated database. This setup simplifies data management while maintaining privacy and scalability​. Second, SQLite has found new applications in web-based environments with the rise of WebAssembly (WASM). By embedding SQLite databases directly into browsers, developers can provide fast, local data storage that complements server-side databases. This enables efficient offline functionality and performance gains for web apps​. For a detailed example of this use case, check out Notion’s excelent blog [post](https://www.notion.so/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite) on how they sped up their browser app.

More and more people, myself included, are becoming intrigued by SQLite. However, for those transitioning from other database systems, there are a few surprising differences to discover.

## Weak out of the box guarantees

Have you ever wanted to insert a text value into a column designated as a boolean, only to have MySQL prevent it? Me neither. But we also can't guarantee that a new intern won’t get overly enthusiastic one day or that an unexpected parsing bug might someday return a text value instead of a boolean and attempt to insert it into the database. While other databases enforce data types, SQLite, by default, doesn’t prevent inserting different types into columns than the defined type might suggest—unless properly configured. So, let's put this to the test. We will create simple table for products:

```sql
CREATE TABLE product (
  id VARCHAR(8) PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER
);
```

And we will try to insert both correct and faulty data for column 'quantity':

``` sql {linenos=inline}
INSERT INTO PRODUCT VALUES ('acbdb5a5', 'Raspberry Pi 5', 'Computer', 32);

INSERT INTO PRODUCT VALUES ('0ac595de', 'EW3270U', 'Monitor', 'a lot');
```

```bash {linenos=inline}
sqlite> CREATE TABLE product (id VARCHAR(36)PRIMARY KEY,name TEXT NOT NULL,TYPE TEXT NOT NULL,quantity INTEGER);
```


```bash
+--------------------------------------+----------------+----------+----------+------------------+
|                  id                  |      name      |   TYPE   | quantity | typeof(quantity) |
+--------------------------------------+----------------+----------+----------+------------------+
| acbdb5a5-3598-4085-9b19-33c6768833b2 | Raspberry Pi 5 | Computer | 32       | integer          |
| 0ac595de-7c69-4616-a76c-6e7e999d856c | EW3270U        | Monitor  | a lot    | text             |
+--------------------------------------+----------------+----------+----------+------------------+

```




<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>


---
```
sqlite> .mode box
sqlite> select * from t;
┌───┬──────┐
│ v │ text │
├───┼──────┤
│   │ hey  │
└───┴──────┘
```

