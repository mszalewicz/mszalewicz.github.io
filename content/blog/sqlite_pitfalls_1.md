---
title: "SQLite Pitfalls"
date: 2024-11-11T10:20:42+01:00
tags: ["SQL", "SQLite"]
draft: false
---

SQLite is the world’s  [most widely](https://www.sqlite.org/mostdeployed.html) used database, powering the backends of countless applications. For most software, it offers a reliable solution for embedded data storage, eliminating the need to reinvent the wheel. Its broad adoption means developers benefit from a well-documented, dependable tool with a familiar SQL dialect.

<!--more-->

Recent interest in SQLite has surged, particularly due to its fit for two key technological trends. First, it’s a strong choice for multi-tenant architectures, where platforms leverage SQLite to give each tenant an isolated database. This setup simplifies data management while maintaining privacy and scalability. Second, SQLite has found new applications in web-based environments with the rise of WebAssembly (WASM). By embedding SQLite databases directly into browsers, developers can provide fast, local data storage that complements server-side databases. This enables efficient offline functionality and performance gains for web apps. For a detailed example of this use case, check out Notion’s excelent blog [post](https://www.notion.so/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite) on how they sped up their browser app.

More and more people, myself included, are becoming intrigued by SQLite. However, for those transitioning from other database systems, there are a few surprising differences to discover.

## Weak out of the box guarantees

Have you ever wanted to insert a text value into a column designated as a boolean, only to have MySQL prevent it? Me neither. But we also can't guarantee that a new intern won’t get overly enthusiastic one day or that an unexpected parsing bug might someday return a text value instead of a boolean and attempt to insert it into the database. While other databases enforce data types, SQLite, by default, doesn’t prevent inserting different types into columns than the defined type might suggest—unless properly configured. So, let's put this to the test. We will create simple table for products:

```sql
CREATE TABLE product (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  quantity INTEGER
);
```

We will attempt to insert both valid and invalid data into the 'quantity' column, to examine the results of each operation:

``` sql
INSERT INTO product VALUES ('acbdb5a5', 'Raspberry Pi 5', 'Computer', 32);
INSERT INTO product VALUES ('0ac595de', 'EW3270U', 'Monitor', 'a lot');

SELECT *, typeof(quantity) FROM product;
```

I've added a typeof() conversion to inspect how SQLite stores data underneath. Even if an incorrect data type is inserted into an INTEGER column, the database neither raises an error nor issues a warning. Instead, SQLite joyfully stores the value without any indication of a mismatch. Here is the result of test:

```
+----------+----------------+----------+----------+------------------+
|    id    |      name      |   type   | quantity | typeof(quantity) |
+----------+----------------+----------+----------+------------------+
| acbdb5a5 | Raspberry Pi 5 | Computer | 32       | integer          |
| 0ac595de | EW3270U        | Monitor  | a lot    | text             |
+----------+----------------+----------+----------+------------------+
```

While insertion of mismatched type described above would lead to error in MySQL:

```
ERROR 1366 (HY000) at line 21: Incorrect integer value: 'a lot' for column 'quantity' at row 1
```

Users who are accustomed to other databases and expect standard type enforcement might encounter this SQLite behavior unexpectedly — potentially in a production environment, where it could lead to subtle, hard to diagnose issues. Fortunately, there’s a straightforward solution to enforce stricter type constraints in SQLite, which we’ll discuss after addressing another related pitfall that this solution also mitigates.

As if mismatched column types weren’t enough, consider this: in SQLite, you can insert NULL values into primary key columns. Surprising, right? By default, SQLite doesn’t enforce NOT NULL constraints on primary key columns unless explicitly set. Now, if the primary key is defined as INTEGER PRIMARY KEY AUTOINCREMENT, inserting a NULL triggers automatic assignment of a unique, incremented integer. But if you’re using a TEXT primary key—such as with UUIDs—SQLite, by default, will accept NULL values even if the column is marked as PRIMARY KEY, which can lead to unexpected issues in data integrity.

```sql
INSERT INTO product VALUES (NULL, 'ABC', 'does not matter', '-∞');
INSERT INTO product VALUES (NULL, 'DEF', 'still irrelevant', '∞+');

SELECT * FROM product;
```

Result:

```
+----------+----------------+------------------+----------+
|    id    |      name      |       TYPE       | quantity |
+----------+----------------+------------------+----------+
| acbdb5a5 | Raspberry Pi 5 | Computer         | 32       |
| 0ac595de | EW3270U        | Monitor          | a lot    |
|          | ABC            | does not matter  | -∞       |
|          | DEF            | still irrelevant | ∞+       |
+----------+----------------+------------------+----------+
```

Yes, in SQLite, you can indeed insert as many NULL primary keys as you want, without any constraints to prevent this. I haven’t found a definitive explanation for why SQLite, by default, allows both incorrect data types and NULL values in primary key columns. The best rationale I’ve come across suggests that this behavior was chosen to maintain backward compatibility. However, why it was implemented this way initially remains something of a mystery.

Fortunately, SQLite provides a straightforward solution to enforce stricter type and constraint rules: the **STRICT** table option. By specifying **STRICT** in your table creation schema, you can ensure that SQLite enforces proper type checking and disallows NULL values in primary keys:

```sql
CREATE TABLE product (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  quantity INTEGER
) STRICT;
```

With this scheme, when we try to insert:

``` sql
INSERT INTO product VALUES ('0ac595de', 'EW3270U', 'Monitor', 'a lot');
```

We will get error:

```
Runtime error: cannot store TEXT value in INTEGER column product.quantity (19)
```

And trying to insert NULL primary key:

```sql
INSERT INTO product VALUES (NULL, 'ABC', 'does not matter', '∞');
```

will result in SQLite rejecting it:

```
Runtime error: NOT NULL constraint failed: product.id (19)
```

## Conclusion

While the solution to these issues is straightforward, cleaning up the mess left by subtle bugs caused by SQLite’s default behavior can be a challenging and time-consuming process. These were just the first set of the most surprising issues I encountered in my experience with SQLite.

There are additional quirks and idiosyncrasies that developers should be aware of, such as enabling foreign key constraints (which are off by default), handling the SQLITE_BUSY error when dealing with concurrent database access, and managing large-scale deletions to shrink database size effectively. I’ll explore these topics in my next entry on working with SQLite, where I’ll dive into best practices for addressing these unique aspects of the database.

Despite these hurdles, I’ve grown quite fond of SQLite, appreciating the versatility and quality of this open-source project. Its unique approach to data storage and lightweight design make it an invaluable tool in many applications. I’m genuinely excited to deepen my understanding of SQLite’s nuances and explore its full potential as I continue working with it.