---
layout: post
title: "어떻게 해야 Go를 잘 쓸까 고민(Effective Go) 3"
date: 2020-02-03 01:28:00 +0700
categories: [golang, effectivego]
published: false
---

> Effective Go 문서를 읽어보면서, Golang에 대한 이해를 높이고 좋은 코드를 작성하는 것이 목표입니다.
>
> (Data)

<br/>

## Data

### Allocation with `new`

Go 에는 두가지 메모리 할당 방법이 있습니다. `new`와 `make` 입니다. 이 두가지는 혼동될 수 있으나, 규칙은 꽤 간단합니다. 먼저 `new`에 대해서 알아보도록 하겠습니다. `new`는 메모리 할당을 하는 함수인데, 다른 언어에서와 같이 메모리를 초기화 하는 것은 아닙니다. 그저 0으로 만드는 것입니다. 즉, `new(T)` 와 같이 사용하면, T 타입의 값을 zero value로 할당하고 그 포인터를 return해 줍니다. T 타입의 값이 zero value인 새롭게 할당된 포인터를 return해 주는 것입니다.

이는 데이터 구조를 설계하는 것을 다룰 때 유용합니다. 별다른 초기화 작업 없이 zero value로 된 객체를 사용할 수 있게 되는 것입니다.

`bytes.Buffer`의 zero value는 빈 buffer이고, `sync.Mutex`는 명시적인 생성자나 Init 메소드가 없는 데신 zero value를 unlocked mutex의 형태로 정의합니다.

```go
// SyncedBuffer 타입은 할당 또는 그냥 선언을 통해 바로 사용될 수 있다.
type SyncedBuffer struct {
  lock   sync.Mutex
  buffer bytes.Buffer
}

// p, v는 별다른 초기화 작업 없이 바로 사용할 수 있다.
p := new(SyncedBuffer) // type : *SyncedBuffer
var v SyncdedBuffer    // type : SyncedBuffer
```

<br/>

### Constructors and composite literals

그러나 가끔, zero value로는 충분하지 않을 때가 있습니다. 초기화 생성자가 필수적일 때가 있습니다. 다음과 같은 경우를 살펴봅니다.

```go
func NewFile(fd int, name string) *File {
  if fd < 0 {
    return nil
  }
  f := new(File)
  f.fd = fd
  f.name = name
  f.dirinfo = nil
  f.nepipe = 0
  return f
}
```

이런식으로 사용하는 것은 불편합니다. 이를 다음과 같이 표현할 수 있습니다.

```go
func NewFile(fd int, name string) *File {
  if fd < 0 {
    return nil
  }
  f := File{fd, name, nil, 0}
  return &f
}
```

C와는 다르게, Go에서는 지역변수의 주소를 return하는것이 가능하고, 좋은 방법입니다. 함수가 return 될 때, 해당하는 변수의 저장 공간을 살려두기 때문입니다. 마지막 두 줄을 합쳐서

```go
return &File{fd, name, nil, 0}
```

과 같이 한줄로 표현할 수 있습니다. 다만 여기서 불편한 점은, 각 위치에 해당하는 값이 순서대로 들어가야하며, 4가지 값이 모두 있어야 한다는 것입니다. 이는 값에 라벨링을 함으로써 해결할 수 있습니다. 제공되지 않는 값은 zero-value를 가지면 되겠지요.

```go
return &File{fd: fd, name: name}
```

`newFile` 함수는 *File 형태의 값을 return하니까, `new(File)` 은 `&File{}` 과 같다고 할 수 있습니다. File{ ... } 이런식으로 작성하는 것을 `composite literal`을 이용한다고 말합니다. 이 `composite literal`은 arrays, slices, maps 에 다음과 같이 사용 될 수도 있습니다.

```go
a := [...]string{"no err", "Eio", "in"}
s := []string{"no err", "Eio", "in"}
m := map[string]interface{}{"name": "hihi", "age": 24}
```

<br/>

### Allocation with `make`

`make`는 `new`와는 좀 다릅니다. `make(T, args)` 와 같이 사용하며, slices, maps, channels를 만들 때 사용합니다. T 타입의 초기화된 값을 return 해줍니다. 포인터를 리턴해주는 것이 아닙니다.

예를들어 slice의 경우, 데이터의 포인터, length, capacity에 대한 값이 있기 전에는 nil에 불과합니다. make함수가 이 값을 초기화 해주는 작업을 해줍니다.

```go
make([]int, 10, 100) // make(type, length, capacity)
```

위 코드는, 100개의 int값이 담길 수 있는 공간을 할당하고, 길이가 10인 slice를 생성합니다. capacity는 생략될 수 있습니다.

```go
new([]int)
```

를 사용했다면, nil slice의 포인터를 갖게 되는 거겠지요.

그래서 slice를 생성할 때는 다음과 같이 하면 되겠습니다.

```go
v := make([]int, 100)

// new를 사용한다면..
var p *[]int = new([]int)
*p = make([]int, 100)
// 이렇게 되겠지만, 이런 방식은 불필요
```

<br/>

### Arrays

C와 Go의 차이점 중, Array와 관련해서는 다음과 같은 것들이 있습니다.

* Array는 값 자체이다.
* 특히, array를 함수에 전달할 때, 함수는 array의 copy된 것을 받는다. 포인터를 받지 않는다.
* Array의 크기 자체가 타입을 구별한다. `[10]int` 와 `[20]int`는 다른 타입이다.

C에서 사용되는 것과 같이 Go에서 사용하려면 다음과 같이 코드를 작성해야하지만, 이는 Go에서 관용적으로 사용되는 방식이 아닙니다. 이 방식 대신 Slice를 사용해야합니다.

```go
func Sum(a *[3]float64) (sum float64) {
  for _, v := range *a {
    sum += v
  }
  return
}
array := []float64{7.0, 8.5, 9.1}
x := Sum(&array)
```

<br/>

### Slices

Go에서 대부분의 Array 프로그래밍을 할 때는, 단순한 Array보다는 Slice를 사용하는 것이 좋다.

<br/>

### Two-dimensional slices



### Maps



### Printing



### Append

