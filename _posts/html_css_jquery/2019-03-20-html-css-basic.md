---
layout: post
title:  "HTML/CSS Basic"
date:   2019-03-20 19:00:00 +0700
categories: [html, css]
---

처음으로 HTML,CSS를 접하신 분들에게 난이도가 높았을 것 같습니다…(ㅜㅜ)

<br/>

오늘 진행한 내용 = [ HTML에 대한 소개, CSS에 대한 간략한 소개, 미니언즈 소개 홈페이지 구성]



## HTML

```html
<!doctype html>
<html>
    <head>
		<!-- 1개의 head -->
    </head>
    <body>
        <!-- 1개의 body -->
    </body>
</html>
```

* html코드는 위와 같은 구조를 갖습니다.

* 우리가 **vscode**에 깔았던 extensions : **html snippets**, **open html in default browser**

  * html snippets : [emmet](https://code.visualstudio.com/docs/editor/emmet) 사용
  * open html in default browser : **Windows** - `ctrl + 1`  or **MAC** - `cmd + 1` 로 작업하던 html을 default browser로 열기!

  > 기본 웹 브라우저는 **크롬**으로 하는 것을 권장해요..

* `! + tab` 또는 `html:5 + tab` 로 기본 틀을 바로 완성 가능합니다!(갓 emmet)

<br/><br/>

## CSS

* **.class** - 앞으로 많이 쓸 클래스,,
* **#id** - 특별 취급을 받아야 하는 태그에만 써주도록 합니다.

> css에서 class에 접근할 때는 **점(' . ')** , id에. 접근할 때는 **#**!

<br/>

<br/>

## Minions 소개 홈페이지를 만들어보아용!

가장 먼저 해야할 것은 **Visual Studio Code**를 실행한 후, **프로젝트를 진행할 폴더**를 열어주는 거에요!

<br/>

### 0. 태그 소개

* `video`

  * Minions 합창 영상을 유투브 영상 다운로드 사이트를 통해 다운 받은 후,

  * 이름을 관리하기 쉽게 변경해서 프로젝트 폴더에 저장!

  * ```html
    <video src="minions_sing.mp4" autoplay muted loop></video>
    ```

    autoplay : 영상을 자동으로 재생시킴

    muted : 쉿!

    loop : 동영상이 끝나면 다시 처음부터 재생(반복)

    > 브라우저에 버전에 따라 muted 속성이 없으면 영상이 재생 안되기도 했습니다.

    <br/>

* `img`

  * [나무위키 - 미니언즈](https://namu.wiki/w/%EB%AF%B8%EB%8B%88%EC%96%B8%EC%A6%88) 에 있는 사진들을 많이 갖고 왔습니다!

  * 개발자도구(`F12` 또는 `command + option + i`)를 열고 좌상단에 있는 버튼을 클릭하여 원하는 부분을 잘 클릭하면, 

    ```html
    <img class="wiki-image" src="//w.namu.la~~~~" ... >
    ```

    이런식으로 있는 코드를 확인 할 수 있습니다.

    src안의 부분을 **더블 클릭** 한 후, **https:** 를 앞에 붙여줄 수 있도록 합다.

    >  웹의 주소 형식 중에 '**//w.~~**' 이런식으로 시작하는 건 없어요. 우리가 보는 대부분의 웹페이지는 **http://** 또는 **https://** 로 시작됩니다.

    > 여기선 그냥 이미지를 우클릭 한 후, **이미지 주소 복사** 를 하는게 간편했어요.

    <br/>

    > `video` , `img` 태그는 둘다 **src** 로 무언가(영상 또는 사진)을 참조한다는 것을 기억하세요!

<br/>

* `a` 

  * ```html
    Images from <a href="https://namu.wiki/w/%EB%AF%B8%EB%8B%88%EC%96%B8%EC%A6%88">namuwiki</a>
    ```

  * 이런식으로 `a` tag에서는 **href**를 사용했습니다!!

  > [**href** 와 **src** 는 뭐가 다른걸까?](https://jywork.tistory.com/2) - 캬, 명확한 설명

<br/>

<br/>

### 1. 홈페이지 구조잡기

* index.html

```html
<!DOCTYPE html> <!-- !+tab or html:5+tab -->
<html lang="en"> <!-- en -> ko 로 바꿔도 됩니다. 까먹지 않았으면 바꿔봅시다. -->
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    
    <title>MINIONS</title> <!-- 내가 원하는대로 title 설정해줍시다! -->
</head>
<body>
    <header>
        
    </header>
    
    <div id="main">
        
    </div>
    
    <footer id="footer">
        
    </footer>
</body>
</html>
```

<br/>

### 2. Menu(header)

```html
...
    <header>
	<!-- header는 div class="header" 로 쓰는 것과 같은 의미에요.
		아, css에서 .header로 접근할 수 있다는 말이 아니니 오해마세요!! -->
        
    	<ul class="menu">
	       	<!-- emmet : li*4>a -->
            
       		<li><a href="#"><img id="logo" src="로고 주소" alt=""></a></li>
       		<li><a href="#main">Video</a></li>
            <!-- href에 #name 을 값으로 주면 name을 id로 갖는 태그쪽으로 이동하게 됩니다! -->
            
       		<li><a href="#minions">Minions</a></li>
       		<li><a href="#footer">End</a></li>    
   		</ul>
	</header>
...
```

<br/>

### 3. Main

```html
...
	<div id="main">
        <video src="videos/superbad_minions.mp4" autoplay muted loop></video>
        <img class="minion" src="케빈주소 img 주소" alt="">
        <img class="minion" src="스튜어트 img 주소" alt="">
        <img class="minion" src="밥 img 주소" alt="">
    </div>
...
```

<br/>

### 4. Footer(footer)

```html
...
	<footer id="footer">
        <p>Images from <a href="나무위키-미니언즈 사이트 주소">'namuwiki'</a></p>
    </footer>
...
```

<br/>

### 5. 폰트 적용하기

>  [눈누난나](https://noonnu.cc/about) 사이트를 적극 활용하세요!(이 사이트의 존재를 너무 늦게 알았습니다.. 맨날 구글 폰트만 썼는데…ㅜ)

**취저** 폰트를 찾았다면, **웹 폰트로 사용하기** 부분에서 코드를 복사해줍니다.

ex)

```css
@font-face { font-family: 'locus_sangsang'; src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/locus_sangsang.woff') format('woff'); font-weight: normal; font-style: normal; }
```

> 이런 형태의 것을 **index.css** 라는 파일을 만들어서, 맨 꼭대기에 붙여넣습니다!

<br/>

* index.css

* ```css
  body {
      font-family: 'locus_sangsang'; /* 복사한 폰트의 font-family에 해당하는 부분 그대로! */
  }
  ```

> body 태그 안에 있는 모든 글씨체를 'locus_sangsang' 으로 변경시킨다는 뜻!

<br/>

### 6. css 연결하기

* index.html

  ``` html
  		...
  		<title>MINIONS</title>
  		<link rel="stylesheet" href="index.css" type="text/css">
  		<!-- 이렇게 link 해주어야 index.html이 css를 참조할 수 있습니다. -->
  	</head>
  	<body>
          ...
  ```

  > type="text/css" 를 적어주는 것은 좋은 습관입니다. [(링크)](https://html.com/attributes/link-type/)

<br/>

<br/>

## 끝

* codecademy css 편 수강하시면 더 도움이 될 거에요!