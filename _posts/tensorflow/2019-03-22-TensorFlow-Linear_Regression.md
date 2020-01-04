---
layout: post
title:  "Tensorflow : Multivariable Linear Regression"
date:   2019-03-22 21:46:00 +0700
categories: [tensorflow, python]
---

<br>

> 자료 참고 : [Inflearn - 모두를 위한 딥러닝](https://www.inflearn.com/course/%EA%B8%B0%EB%B3%B8%EC%A0%81%EC%9D%B8-%EB%A8%B8%EC%8B%A0%EB%9F%AC%EB%8B%9D-%EB%94%A5%EB%9F%AC%EB%8B%9D-%EA%B0%95%EC%A2%8C/)

<br>

## Multivariable Linear Regression

* **행렬** 연산을 생각하자.

{%raw%}

$$H(x)=w \cdot x+b$$ : Linear Regression

$$H(X)=W \cdot X+b$$ : Multivariable Linear Regression

{%endraw%}

```python
import tensorflow as tf
x_data = [[73.,80.,75.],[93.,88.,93.],[89.,91.,90.],[96.,98.,100],[73.,66.,70]]
y_data = [[152.],[185.],[180.],[196.],[142.]]

#shape 형태를 주목하자.
X = tf.placeholder(tf.float32,shape=[None,3])
Y = tf.placeholder(tf.float32,shape=[None,1])

W = tf.Variable(tf.random_normal([3,1]))
b = tf.Variable(tf.random_normal([1]))

# 행렬 곱을 실시한다.
# [None,3]*[3,1] -> [None,1] 의 형태이다.
hypothesis = tf.matmul(X,W)+b

cost = tf.reduce_mean(tf.square(hypothesis-Y))
optimizer = tf.train.GradientDescentOptimizer(learning_rate = 1e-5)
train = optimizer.minimize(cost)

sess = tf.Session()
sess.run(tf.global_variables_initializer())

for step in range(2001):
    cost_val, hy_val, _ = sess.run([cost,hypothesis,train],
                                   feed_dict={X:x_data,Y:y_data})
    
    if step%100==0:
        print(step,cost_val,hy_val)
```

<br><br>

## How to Import File

```python
import tensorflow as tf
import numpy as np

xy = np.loadtxt('data-01-test-score.csv',delimiter=',',dtype=np.float32)
x_data = xy[:,0:-1]
y_data = xy[:,[-1]] # ***data의 형태를 주목하자.


# Linear Regression 과정은 동일하다.
# placeholder와 Variable의 shape를 주목해야한다.
X = tf.placeholder(tf.float32,shape=[None,3])
Y = tf.placeholder(tf.float32,shape=[None,1])

W = tf.Variable(tf.random_normal([3,1]))
b = tf.Variable(tf.random_normal([1]))

hypothesis = tf.matmul(X,W)+b
cost = tf.reduce_mean(tf.square(hypothesis-Y))
optimizer = tf.train.GradientDescentOptimizer(learning_rate = 1e-5)

train = optimizer.minimize(cost)

sess = tf.Session()
sess.run(tf.global_variables_initializer())
for step in range(2001):
    cost_val,hy_val,_=sess.run([cost,hypothesis,train],feed_dict={X:x_data,Y:y_data})
    if step%20==0:
        print(step,cost_val)
        # hypothesis의 결과와 y_data의 값이 어느정도 차이나는지의 비율의 평균을 내본것이다.
        percent = np.average([h/a*100 for h,a in zip(hy_val,y_data)])
        print(percent)
```

<br/>

> Multivariable Linear Regression 이나 단일 변수 회귀 분석이나 그 알고리즘은 똑같다.
>
> 변수의 shape이 중요해짐을 기억해야한다.