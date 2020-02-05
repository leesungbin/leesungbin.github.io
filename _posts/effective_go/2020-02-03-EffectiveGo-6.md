---
layout: post
title: "어떻게 해야 Go를 잘 쓸까 고민(Effective Go) 6"
date: 2020-02-05 14:33:00 +0700
categories: [golang, effectivego]
published: true
---

> Effective Go 문서를 읽어보면서, Golang에 대한 이해를 높이고 좋은 코드를 작성하는 것이 목표입니다.
>
> (Errors, Web server)

## Errors

Go의 multivalue return은 에러 처리에 사용되기 좋다. `*os.Open`은 에러 발생시 nil 과 함께 무엇이 잘못되었는지에 관한 에러 내용까지 return해 준다.

error 타입은 다음과 같은 build-in interface를 갖는다.

```go
type error interface {
  Error() string
}
```

라이브러리 개발시 인터페이스를 자유롭게 구현하면서, 에러를 보여줄 뿐만 아니라, 어떤 맥락에서의 에러인지도 함께 제공해 주는 것이 좋다. `os.Open`의 경우 `*os.File` 과 함께 에러값도 리턴해준다. 파일이 성공적으로 열면 에러는 `nil`이고, 파일을 여는 중 에러가 발생하면 `os.PathError`의 값을 가지게 된다.

```go
type PathError struct {
  Op string   // "open", "unlink", ...
  Path string // "관련된 위치"
  Err error
}

func (e *PathError) Error() string {
  return e.Op + " " + e.Path + ": " + e.Err.Error()
}
```

이런식으로 구현된, `PathError`의 `Error()` 메소드의 결과는 다음과 같을 것이다.

```text
open /etc/passwx: no such file or directory
```

단순히 `no such file or directory` 보다 훨씬 많은 정보를 제공해준다. 에러 문자열은 에러가 발생된 command나 package를 접두어로 사용하는 등의 방식으로, 에러가 어디서 발생했는지를 알려주어야한다.

### Panic

복구할 수 없는 에러가 발생할 경우, 프로그램을 더 진행시킬 수 없다. 이 때 `panic` 이라는 build-in function을 사용할 수 있는데, 실제 라이브러리에서는 `panic`을 피하는 것이 좋다. 다만, 라이브러리의 초기 세팅이 실패한 경우에는 패닉을 알려주어야 할 것이다.

### Recover

Indexing 에러 등의 런타임 에러를 포함한 패닉이 발생했을 때, 실행중인 함수는 즉각 중된 다고, 모든 defer 함수를 실행하면서 goroutine 스택을 풀기 시작한다. 이 때 `recover`로 , goroutine의 통제권을 다시 얻을 수 있다.

`recover` 호출시 `panic`에 전달된 인자값이 리턴된다. `recover`는 오직 defer 함수 내에서만 유용하다.

서버 내에 실행중인 다른 goroutine들은 죽이지 않고, 실패한 goroutine만 종료시키는 것이 그 응용 사례가 될 수 있다.

```go
func server(workChan <-chan *Work) {
  for work := range workChan {
    go safelyDo(work)
  }
}

func safelyDo(work *Work) {
  defer func() {
    if err := recover(); err != nil {
      log.Println("work failed:", err)
    }
  }()
  do(work)
}
```

`do(work)`에서 패닉 발생시, 그 결과가 log로 남겨지고, 해당 goroutine은 다른 goroutine을 방해하지 않으면서 종료될 것이다. `recover`는 defer 내에서 호출되지 않으면 항상 nil을 리턴한다.

이를 활용하여 복잡한 소프트웨어에서의 에러핸들링을 단순화할 수 있다. 

<br/>

`doParse`가 패닉을 발생시키면, defer 함수가 실행되며 return 값이 nil이 되며, 

## A web server

다음 예제는 어떤 문자열에 대한 QR 코드를 생성하는 것입니다. `chart.apis.google.com` 에서는 문자열에 대한 QR코드를 생성해줍니다. 사용자에 입력에 대하여, QR코드를 보여주는 웹 서버를 만들어봅니다.

```go
package main

import (
  "flag"
  "html/template"
  "log"
  "net/http"
)

var addr = flag.String("addr", ":1718", "http service address")
var templ = template.Must(template.New("qr").Parse(templateStr))

func main() {
  flag.Parse()
  http.Handle("/", http.HandlerFunc(QR))
  err := http.ListenAndServe(*addr, nil)
  if err != nil {
    log.Fatal("ListenAndServe:", err)
  }
}

func QR(w http.ResponseWriter, req *http.Request) {
  templ.Execute(w, req.FormValue("s"))
}

const templateStr = `
<html>
<head>
<title>QR Link Generator</title>
</head>
<body>
{{if .}}
<img src="http://chart.apis.google.com/chart?chs=300x300&cht=qr&choe=UTF-8&chl={{.}}" />
<br/>
{{.}}
<br/>
<br/>
{{end}}
<form action="/" name=f method="GET">
<input maxLength=1024 size=70 name="s" value="" title="Text to QR Encode"/>
<input type="submit" value="Show QR" name="qr"/>
</form>
</body>
</html>
`
```

<br/>

<br/>

## References

* https://golang.org/doc/effective_go.html