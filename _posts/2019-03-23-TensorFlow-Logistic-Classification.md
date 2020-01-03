---
layout: post
title:  "Tensorflow : Logistic(Regression) Classification"
date:   2019-03-22 21:46:00 +0700
categories: [tensorflow, python]

---

<br>

## (Binary)Logistic Classification

Linear Regression 을 통해서 수치예측을 했었음.

Classification 은 정확한 수치예측 보다는, 어느 그룹에 더 속하는지를 찾는 것에 의미를 둔다.

그렇게 때문에, regression 할 때와 같은 방법으로 진행하게 된다면,

데이터에 따라서 특정 데이터의 해당하는 그룹이 바뀔 수 있다.(line의 기울기 변화)

<br/>

### 1) Logistic Hypothesis

**sigmoid function** : <br/>
$$
H(x)=1/(1+{e}^{(WX+b)})
$$
<br/>

### 2) Cost function

* Cost function은 linear regression 할 때 처럼 하면 안된다.
  * Local minimum에 갇혀버릴 확률이 높기 때문

$$
c(H(x),y)=-log(H(x))\space\space at\space\space y=1
$$

$$
c(H(x),y)=-log(1-H(x))\space\space at\space\space y=0
$$

이 두 개를 한번에 쓰면,<br/>
$$
c(H(x),y) = -ylog(H(x))-(1-y)log(1-H(x))
$$

> 각각 y=1, y=0일 때를 잘 반영해주고 있음을 확인할 수 있다.

<br/>

### 3) 예시

```python
import tensorflow as tf
x_data = [[1,2],[2,3],[3,1],[4,3],[5,3],[6,2]]
y_data = [[0],[0],[0],[1],[1],[1]]

X = tf.placeholder(tf.float32, shape=[None,2])
Y = tf.placeholder(tf.float32, shape=[None,1])
```

train시킬 데이터를 설정 및, 그래프를 구성할 X,Y에 placeholder를 준다.

<br/>

```python
W = tf.Variable(tf.random_normal([2,1]), name='weight')
b = tf.Variable(tf.random_normal([1]), name='bias')

hypothesis = tf.sigmoid(tf.matmul(X,W)+b)

cost = -tf.reduce_mean(Y*tf.log(hypothesis)+(1-Y)*tf.log(1-hypothesis))

train = tf.train.GradientDescentOptimizer(learning_rate=0.01).minimize(cost)

predicted = tf.cast(hypothesis > 0.5, dtype=tf.float32)
accuracy = tf.reduce_mean(tf.cast(tf.equal(predicted,Y), dtype=tf.float32))
```

학습시킬 그래프를 구성해준다.

`tf.matmul(X,W)+b`의 형태를 수학적으로 맞추는 것이 중요하다.(행렬 곱셈)

`tf.cast`함수는 true->1, false->0 이런식으로, bool 데이터를 값으로 변경해준다.

<br/>

```python
with tf.Session() as sess:
    sess.run(tf.global_variables_initializer())
    
    for step in range(10001):
        cost_val,_ = sess.run([cost,train],feed_dict={X:x_data,Y:y_data})
        if step%1000==0:
            print(step,cost_val)
        
    h, c, a = sess.run([hypothesis,predicted,accuracy],feed_dict={X:x_data,Y:y_data})
    print(h,c,a)
```

session을 열고 학습을 시켜준다.

<br/>

결과를 확인해보면 학습한 데이터에 대해서는 완벽한 예측을 할 수 있는 모델을 형성하게 된 것을 확인할 수 있다.