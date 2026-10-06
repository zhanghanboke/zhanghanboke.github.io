---
title: ArrayList 和 LinkedList，到底该用哪个
date: '2026-10-06T20:08:00+08:00'
tags: [Java, 数据结构]
category: 技术笔记
description: 从底层数据结构出发，把 ArrayList 和 LinkedList 的复杂度、内存开销和真实使用场景捋一遍。
---

面试里被问烂了的一道题：`ArrayList` 和 `LinkedList` 有什么区别？

标准答案是"一个是数组，一个是链表，前者查得快，后者增删快"。
但真到写代码的时候，**几乎所有场景都该用 `ArrayList`**，原因值得说清楚。

## 底层结构

`ArrayList` 内部就是一个 `Object[]` 数组：

```java
public class ArrayList<E> extends AbstractList<E> {
    transient Object[] elementData;
    private int size;
}
```

数组在内存里是**连续**的，所以能靠 `首地址 + 下标 × 元素大小` 直接算出元素位置。

`LinkedList` 是双向链表：

```java
public class LinkedList<E> extends AbstractSequentialList<E> {
    transient Node<E> first;
    transient Node<E> last;

    private static class Node<E> {
        E item;
        Node<E> next;
        Node<E> prev;
    }
}
```

每个节点除了存数据，还要存前后两个指针。

## 复杂度对比

| 操作 | ArrayList | LinkedList |
| --- | --- | --- |
| 按下标随机访问 `get(i)` | O(1) | **O(n)** |
| 尾部追加 `add(e)` | 均摊 O(1) | O(1) |
| 头部插入 `add(0, e)` | O(n) | O(1) |
| 中间插入 `add(i, e)` | O(n) | O(n) |
| 按值删除 `remove(obj)` | O(n) | O(n) |
| 内存占用 | 紧凑 | **每元素多 2 个指针** |

## 关键的反直觉点

### 1. LinkedList 的"增删快"要先找到位置

`add(i, e)` 看着是插入，实际上得先遍历到第 `i` 个节点，这一趟就是 O(n)。
所以"中间插入快"这个说法只在**已经持有节点引用**时才成立——
而 Java 的 `LinkedList` 并没有对外暴露节点，你拿不到引用。

### 2. 头部插入 ArrayList 可能反而更快

`ArrayList.add(0, e)` 虽然是 O(n)，但它的 O(n) 是一次 `System.arraycopy`
内存块搬运，CPU 对连续内存的搬运做了大量优化，常数极小。

而 `LinkedList` 的遍历是**指针跳转**，每次都可能触发缓存未命中。
在数据量不大（几千条以内）时，前者经常跑赢后者。

### 3. 内存开销差得不少

每个 `LinkedList.Node` 对象头 + 两个引用，在 64 位 JVM 上开启指针压缩也要 24 字节，
再加数据本身。同样存 100 万个 `Integer`，`LinkedList` 的内存占用可能是 `ArrayList` 的两三倍，
而且对象分散在堆上，GC 压力更大。

## 那 LinkedList 还有用吗

有，但很少：

- **当作 `Deque` 用**——频繁在两端进出。不过这种情况更推荐 `ArrayDeque`，
  它基于循环数组，性能全面优于 `LinkedList`，Java 官方文档也是这么建议的。
- 需要**在遍历中频繁用迭代器删除**当前元素，且数据量很大——链表删除是 O(1)。

## 结论

```java
// 默认选择，90% 的场景
List<String> list = new ArrayList<>();

// 需要栈或双端队列
Deque<String> deque = new ArrayDeque<>();

// 几乎不用
List<String> list = new LinkedList<>();
```

另外两个实践建议：

1. **预估容量**。知道大概要装多少元素时，直接 `new ArrayList<>(10000)`，
   省掉多次扩容和数组复制。
2. **面向接口编程**。声明成 `List<T>`，将来换实现只改一行。

`LinkedList` 更像是数据结构课上用来理解链表的教具，
真写业务代码，`ArrayList` 和 `ArrayDeque` 基本能覆盖全部需求。
