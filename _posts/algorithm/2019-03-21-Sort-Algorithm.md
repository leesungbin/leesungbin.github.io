---
layout: post
title:  "Sorting Algorithm"
date:   2019-03-21 19:00:00 +0700
categories: [cpp, algorithm]
---

내용 참고 : [codeground](https://www.codeground.org/common/popCodegroundNote), [gmlwjd9405.github.io](https://gmlwjd9405.github.io/2018/05/08/algorithm-merge-sort.html)

사용 언어 : cpp

<br/>

## Selection Sort

```cpp
#include <iostream>
using namespace std;

#define MAX 1000
int arr[MAX];
int N;

void Swap(int &a,int &b){
    int temp;
    temp=a;
    a=b;
    b=temp;
}

// 오름차순
void selectionSort(int *arr, int size){
    int min_idx;
    for(int i=0;i<size-1;i++){
        min_idx=i;
        for(int j=i+1;j<size;j++){
            if(arr[j]<arr[min_idx])
                min_idx=j;
        }
        Swap(arr[i],arr[min_idx]);
    }
}

int main(){
    cin >> N;
    for(int i=0;i<N;i++)
        cin >> arr[i];
    selectionSort(arr,N);
    for(int i=0;i<N;i++)
        cout << arr[i];

    cout << endl;
}
```

* 각 자리에 맞는 요소들을 집어넣는 방법

* 매 차례마다 남은 원소들을 모두 확인하기 때문에 시간 복잡도는 최악의 연산 횟수나 평균 연산 횟수나 **`O(N^2)`**

  > 알고리즘의 기초이나,, 알고리즘 대회에서 선택정렬을 쓰진 말자.

<br/><br/>

## Insertion Sort

```cpp
#include <iostream>
using namespace std;

#define MAX 1000
int N;
int arr[MAX];

void insertionSort(int *arr, int N){
    for(int i=1;i<N;i++){
        int temp=arr[i];
        int j=i-1;			// 0 ~ j : 검사 한 부분, i ~ : 검사 할 부분
        for(;j>=0;j--){
            if(arr[j]<temp) // ***
                break;
            arr[j+1]=arr[j];// 뒤로 한칸 밀기
        }
        arr[j+1]=temp; 		// 찾은 위치에 값 집어넣기
    }
}

int main(){
    cin >> N;
    for(int i=0;i<N;i++){
        cin >> arr[i];
    }
    insertionSort(arr,N);
    for(int i=0;i<N;i++){
        cout << arr[i] << ' ';
    }
    cout << endl;
}
```

* 각 원소에 대해 적당한 위치를 찾아주어야 하므로, **총 원소의 개수 O( N )**, **순차적으로 삽입 위치를 찾는데 O( N )**이 들므로
  **`O(N ^ 2)`**

  > 비효율적이므로 잘 쓰이지 않음

<br/><br/>

## Bubble Sort

```cpp
#include <iostream>
#include <algorithm> //swap은 굳이 구현하지 않아도 된다.

using namespace std;
#define MAX 1000

int N;
int arr[MAX];

int main(){
    cin >> N;
    for(int i=0;i<N;i++)
        cin >> arr[i];
    
    for(int i=0;i<N-1;i++){
        for(int j=1;j<N-i;j++){
            if(arr[j-1]>arr[j])
                swap(arr[j-1],arr[j]); //인접한 두개의 원소를 비교하는 것.
        }
    }
    for(int i=0;i<N;i++)
        cout << arr[i] << ' ';
    cout << endl;
}
```

* N번째 까지, 한 차례의 교환 작업이 다 끝나면, 맨 끝에 있는 원소는 정렬된 상태이므로, 다음에는 N-1번째 까지 비교하면 된다.

* 시간복잡도 : (정렬해야 할 원소의 개수 -1)*(최대 교환 수) => **`O(N^2)`**

  > 비효율적임

<br/><br/>

## Merge Sort

```cpp
#include <iostream>
using namespace std;

#define MAX 1000
int sorting[MAX]; //임시 저장 공간이 필요하다.
int arr[MAX]; //sorting으로 분할 정복한 결과들을 arr에 복사하게 된다.

void merge(int *arr, int l,int m,int r){ //two pointer 정렬 방식이다.
    int i=l;
    int j=m+1;
    int k=l;

    while(i<=m && j<=r){ // two pointer
        if(arr[i]>arr[j]){
            sorting[k++]=arr[j++];
        }else{
            sorting[k++]=arr[i++];
        }
    }
    // 어느 한쪽이 다 끝나지 않은 경우, sorting에 복사해준다.
    while(i<=m){ 
        sorting[k++]=arr[i++];
    }
    while(j<=r){
        sorting[k++]=arr[j++];
    }
    // 정렬된 부분을 arr에 복사해준다.
    for(int idx=l;idx<=r;idx++)
        arr[idx]=sorting[idx];

}
void mergeSort(int *arr,int l, int r){
    int m=(l+r)/2;
    if(l<r){
        // 반으로 쪼개나간다.
        mergeSort(arr,l,m);
        mergeSort(arr,m+1,r);
        merge(arr,l,m,r);
    }
}

int main(){
    int N;
    cin >> N;
    for(int i=0;i<N;i++)
        cin >> arr[i];
    mergeSort(arr,0,N-1);
    for(int i=0;i<N;i++)
        cout << arr[i];
}
```

* 입력 데이터의 정렬 상황에 무관하게 정렬 시간이 동일하다. **`O(nlogn)`**

  > 복잡하지만 효율적인 정렬방법이다.

<br/><br/>	

## Quick Sort

```cpp
#include <iostream>

using namespace std;
#define MAX 1000
int N;
int arr[MAX];

int quickSort(int *arr, int left, int right){
    int pivot, left_temp, right_temp;
    //여기서 pivot은 값을 저장하는 역할과 index의 역할 2가지를 모두 수행한다.
    
    left_temp = left;
    right_temp = right;
    pivot = arr[left];
    
    while(left < right){
        while(arr[right] >= pivot && (left < right)){
            right--;
        }
        if(left!=right){
            arr[left]=arr[right];
        }
        while(arr[left]<=pivot && (left<right)){
            left++;
        }
        if(left!=right){
            arr[right]=arr[left];
        }
    }
    //pivot 값 보다 작은 값은 왼쪽으로, 큰 값은 오른쪽으로 몰게 된다.
    
    arr[left] = pivot; //결정된 위치
    pivot = left;
    left = left_temp;
    right = right_temp;
    
    //pivot 위치를 기준으로 왼쪽, 오른쪽 나누어 동일한 작업을 진행
    if(left<pivot) quickSort(arr, left,pivot-1);
    if(right>pivot) quickSort(arr,pivot+1,right);
}

int main(){
    cin >> N;
    for(int i=0;i<N;i++)
        cin >> arr[i];
    quickSort(arr,0,N-1);

    for(int i=0;i<N;i++)
        cout << arr[i] << ' ';

    cout << endl;
}
```

* 핵심은 pivot을 잘 선정하는 것
* pivot을 해당 구간의 중앙값으로 잘 설정하면 **`O(nlogn)`**에 수행할 수 있음
* 만약 매 케이스마다 구간의 가장 큰 값이나 가장 작은 값으로 나누게 되면 **`O(n^2)`** 에 수행하게 됨(최악의 경우)

<br/><br/>

