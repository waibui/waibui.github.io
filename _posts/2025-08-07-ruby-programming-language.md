---
title: "Ruby Programing Language!"
description: Learning Ruby, difference with other programming languages
date: 2025-08-07 15:00:00 +0700
categories: [Progaming Language]
tags: [ruby]
pin: false
comments: true
image:
    path: https://raw.githubusercontent.com/waibui/blog-assets/refs/heads/main/imgs/posts/2025-08-07-ruby-programming-language/ruby.png
    alt: Ruby Programing Language!
---

# Introduction
**Ruby** là ngôn ngữ lập trình bậc cao và mã nguồn mở, đơn giản và thân thiện với Developver. **Ruby** bao gồm nhiều tính năng chính như `OOB`, `Dynamic Typing`, `Readable Syntax`, và `Standard Library collection`.

---
Không giống như các ngôn ngữ khác, **Ruby** sử dụng `puts` để in ra **console**
```ruby
puts "Hello, World!"
```

---
## BEGIN - END stataments
```ruby
END {
    puts "Ass"
}

puts "Body"

BEGIN {
    puts "Head"
}
```
**Syntax** của **Ruby** rất dễ đọc
- **BEGIN**: Khai báo khối mã chạy ngay lập tức khi chương trình bắt đầu
- **END**: Khai báo khối mã chạy ngay lập tức khi chương trình kết thúc

```
Head
Body
Ass
```
---
## Comments
```ruby
# This is a comment.

name = "Madisetti" # This is again comment

=begin
This is a comment.
This is a comment, too.
This is a comment, too.
I said that already.
=end
```
- **Ruby** sử dụng `#` để comment 1 dòng phía sau nó, sử dụng `=begin ... =end` để comment 1 khối nằm trong nó
- **Python** cũng sử dụng `#` để comment 1 dòng phía sau nó, nhưng không có cú pháp để comment nhiều dòng
- **Java** sử dụng `//` để comment 1 dòng phía sau nó, sử dụng `/* ... */` để comment 1 khối nằm trong nó

---
## Class and Object
```ruby
class User
    @@num_users = 0
    def initialize(name, weight)
        @user_name = name
        @user_weight = weight
        @@num_users += 1
    end 
end
```

Không giống với các ngôn ngữ khác
- Class trong **Ruby** bắt đầu bằng `start` và kết thúc bằng `end`
- Function trong **Ruby** bắt đầu bằng `start` và kết thúc bằng `end`, không có `:` hay `{}` để giới hạn phạm vi hàm, không cần `()`
- Giông **Python**, nó không cần dấu `;` để ngăn cách lệnh

```
u1 = User.new("tokuda", 50)
u2 = User.new("Chà Bông", 50)
u3 = User.new("Trà Bông", 500)
```
- **Ruby** tạo đối tượng mới bằng phương thức `new()`, không cần sử dụng từ khóa `new` như **Java**
- Tương tự các ngôn ngữ khác, **Ruby** gọi phương thức thông qua `.`

---
## Variables
Giống **Python**, **Ruby** khai báo biến không cần xác định kiểu dữ liệu

### Global Variables
```ruby
$global_variable = 10

puts $global_variable
class Rybu 
    def print_glb
        puts "Global variable #$global_variable"
    end
end
```
Dùng `$` để khai báo `global variables`
Dùng `#` để gọi biến trong chuỗi

### Instance Variables
```ruby
class User
    def initialize(name, weight)
        @user_name = name
        @user_weight = weight
    end 

    def display_details
        puts "Name: #@user_name, Weight: #@user_weight"
    end
end

user1 = User.new("Chà Bông", 50)
user2 = User.new("Trà Bông", 500)
user1.display_details
user2.display_details
```

```
Name: Chà Bông, Weight: 50
Name: Trà Bông, Weight: 500
```

Khác với **Python** sử dụng `self` để tham chiếu đến đối tượng hiện tại, **Ruby** gọi thẳng bằng `@instance_variable_name`

### Class Variables
Gần giống với **Instace Variable**, nhưng sử dụng 2 ký tự `@@`

```ruby
class User
    @@num_users = 0
    def initialize(name, weight)
        @user_name = name
        @user_weight = weight
        @@num_users += 1
    end 

    def get_number_users
        puts "Number of users: #@@num_users"
    end
end
```

### Constants
**Ruby** đặt tên hằng bằng tên viết hoa, không giống như các ngôn ngữ khác phải sử dụng từ khóa `const` hay `final`
```ruby
class Math
    PI = 3.14
    def show
        puts "PI: #{PI}"
    end
end
```

### Pseudo-Variables
- **self**: Đại diện cho đối tượng nhận (receiver) hiện tại - chính là đối tượng mà phương thức đang được gọi trên đó.
- **true**: Biểu diễn giá trị boolean đúng.
- **false**: Biểu diễn giá trị boolean sai.
- **nil**: Biểu diễn giá trị không xác định, giống **null** hay **undefind** trong ngôn ngữ khác
- **__FILE__**: Trả về tên tệp hiện tại dưới dạng chuỗi.
- **__LINE__**: Trả về số dòng hiện tại trong tệp nguồn.

### Basic Literals

| **Loại Literal**      | **Ruby**                           | **Python**                                    | **Ghi chú**                                               |
| --------------------- | ---------------------------------- | --------------------------------------------- | --------------------------------------------------------- |
| **Integer**           | `123`, `0xFF`, `0b1010`            | `123`, `0xFF`, `0b1010`                       | Giống hệt nhau: hỗ trợ thập phân, nhị phân, thập lục phân |
| **Float**             | `3.14`, `2.0e-3`                   | `3.14`, `2.0e-3`                              | Giống nhau: có hỗ trợ số mũ                               |
| **String**            | `"abc"`, `'abc'`, `%q{}`           | `"abc"`, `'abc'`, `'''abc'''`                 | Ruby có `%q`, Python có `"""` / `'''`                     |
| **Symbol**            | `:name`, `:id`                     | `None` trong Python không có symbol trực tiếp | Python dùng `Enum`, hoặc strings nếu cần tên bất biến     |
| **Array**             | `[1, 2, "a"]`, `%w[a b]`           | `[1, 2, "a"]`                                 | Giống nhau, `%w[]` trong Ruby tương đương list of strings |
| **Hash / Dictionary** | `{name: "Ruby"}` hoặc `{"a" => 1}` | `{"name": "Ruby"}`, `{"a": 1}`                | Rất giống nhau                                            |
| **Boolean**           | `true`, `false`                    | `True`, `False`                               | Giống nhau, chỉ khác viết hoa                             |
| **Nil / None**        | `nil`                              | `None`                                        | Tương đương nhau                                          |
| **Range**             | `1..5`, `1...5`                    | `range(1, 6)`                                 | Python cần `range()`, Ruby có literal trực tiếp           |
| **Regex**             | `/abc/`, `%r{abc}`                 | `r"abc"`                                      | Python dùng prefix `r""`, Ruby dùng dấu `/` hoặc `%r{}`   |

#### Arrays 
```ruby
ary = [  "fred", 10, 3.14, "This is a string", "last element" ]
ary.each do |i|
   puts i
end
```

- Gọi các phương thức để duyệt mảng như: `each`, `map`, `select`, `reject`, `find`, `reduce`,...
- Biến tham số được đặt trong `| |`

- **pack** dùng để chuyển **Array** thành **String**

```ruby
a = [ "a", "b", "c" ]
n = [ 65, 66, 67 ]
puts a.pack("A3A3A3")   #=> "a  b  c  "
puts a.pack("a3a3a3")   #=> "a\000\000b\000\000c\000\000"
puts n.pack("ccc")      #=> "ABC"
```

#### Hashes
```ruby
person = { name: "Trà bông", age: 25 }
person.each do |key, value|
  puts "#{key}: #{value}"
end
```
- Tương tự như **Dictionary** trong **Python**

#### Ranges
```ruby
(10..15).each do |n| 
   print n, ' ' 
end
```
- Tương tự **Python** nhưng **range** sẽ bao gồm cả phần tử cuối cùng

```python
for i in range(1, 20):
    print(i, end=' ')
```
- Để giống với **Python**, thay đổi **Range Operators** thành `...`

---
## Opearators
### Comparison Operators
- **<=>**: Toán tử **spaceship**, không có trong **Python**

```ruby
5 <=> 10      # => -1
10 <=> 10     # => 0
20 <=> 10     # => 1
```

- **===**: Dùng để so sánh kiểu dữ liệu

```ruby
case "abc"
when String
  puts "This is a String"
end
```

- **eql?** vs **==**

```ruby
5 == 5.0       # => true
5.eql?(5.0)    # => false (khác kiểu: Integer vs Float)
```

- **equal?**: So sánh đối tượng

```ruby
a = "hello"
b = "hello"
a.equal?(b)     # => false (khác object)

c = a
a.equal?(c)     # => true (cùng object)
```
Giống với `is` trong **Python**

### Parallel Assignment
Thay vì viết như này 
```ruby
a = 10
b = 20
c = 30
```

Ta có thể viết như này
```ruby
a, b, c = 10, 20, 30
```

```ruby
=begin
tmp = a
a = b
b = tmp
=end

a, b = b, a
```
- Cú pháp của **Python** cũng tương tự

### Ternary Operator
```ruby
age = 20
puts age >= 18 ? "Adult" : "Child"
# => "Adult"
```

```python
age = 20
print("Adult" if age >= 18 else "Child")
# => "Adult"
```
- Cũng tương tự nhau, khác mỗi cú pháp :))))

### defined? Operators
```ruby
defined? expression
```
- Trả về một `string` mô tả loại nếu biểu thức tồn tại.
- Trả về `nil` nếu không được định nghĩa.

### Double Colon "::" Operators
Dùng để truy cập:
- **Constants** trong `module/class`
- **class/module** bên trong `module`

## if ... else Statement
- Cú pháp tương tự **Python** nhưng có từ khóa `end` ở cuối 

```ruby
x = 1
if x > 2
   puts "x is greater than 2"
elsif x <= 2 and x!=0
   puts "x is 1"
else
   puts "I can't guess the number"
end
```
- **if modifier**

```ruby
$a = 1

puts "a" if $a == 1
```
- Trong **Python** cần có điều kiện `else` phía sau
- Ngoài ra còn sử dụng `unless` thực thi code nếu điều kiện `false`

```ruby
x = 1 
unless x>=2
   puts "x is less than 2"
 else
   puts "x is greater than 2"
end
```
- **unless modifier**

```ruby
$var = false
print "3 -- Value is set\n" unless $var
```
- `unless` ở đây tương tự như `if not` trong **Python**
- Trong **Ruby**, `case...when` là một cấu trúc điều kiện tương tự như `switch...case` trong các ngôn ngữ khác 

```ruby
day = "Monday"

case day
when "Monday"
  puts "Start of the week"
when "Friday"
  puts "End of the work week"
else
  puts "Midweek"
end
```

## Loops
### while Statement
```ruby
$i = 0
$len =  5

while $i < $len do
  puts $i
  $i += 1
end
```
- Từ khóa `do` không bắt buộc, có thể bỏ
- Cấu trúc tương tự **Python** khi bỏ `do`

- **while modifier** tương tự như `do...while` ở các ngôn ngữ khác, `code` được thực thi 1 lần trước khi kiểm tra điều kiện

```ruby
$i = 0
$len =  5

begin
    puts $i
    $i += 1
end while $i < $len
```

### until Statement
Trái với **while Statement**, nó thực thi `code` cho đến khi điều kiện đúng, nhưng có điểm chung là có thể bỏ `do`

```ruby
$i = 0
$len =  5

until $i > $len do
  puts $i
  $i += 1
end
```
- **until modifier** giống với **while modifier**, nó thực thi code ít nhất 1 lần 

### for Statement   
```ruby
for i in 0...5
   if i > 2 then
      break
   end
   puts "Value of local variable is #{i}"
end
```
Tương tự như **Python**

```python
for i in range(0, 5):
    print(i)
```

### next Statement
Tương tự với từ khóa `continue` trong `loop` của các ngôn ngữ khác

```ruby
for i in 0..5
   if i < 2 then
      next
   end
   puts "Value of local variable is #{i}"
end
```

### redo Statement
Lặp lại lần hiện tại của vòng lặp mà không kiểm tra lại điều kiện và không tăng biến đếm.

```ruby
restart = false

for x in 2..20
    if x == 15
        if restart == false

            puts "Re-doing when x = " + x.to_s
            restart = true

            redo
        end
    end
    puts x
end
```
- Đây là từ khóa khá lạ `re do` tức làm lại với giá trị `x` vừa dùng
- Trong **Python** không có từ khóa này

### retry Statement
```ruby
attempts = 0
begin
  attempts += 1
  puts "Try #{attempts}"
  raise "Error!" if attempts < 3
rescue
  retry if attempts < 3
end
```
- `retry` quay lại `begin` để  thử `code` nếu chưa đủ số lần

## Methods
Cú pháp tương tự **Python**, gọn hơn **Java**, bỏ một số ký tự như `:`, `{}`, kết thúc hàm bằng từ khóa `end`

```ruby
def test(name = "Chà Bông", weight = 50)
  puts "Name: #{name}"
  puts "Weight: #{weight}"
end

test
test "Trà Bông", 500

# Name: Chà Bông
# Weight: 50
# Name: Trà Bông
# Weight: 500
```
- Khi gọi hàm không cần `()`

### return Statement
```ruby
def test
  a = 1
  b = 2
end

puts test

# 2
```
- Mặc định nếu không có từ khóa **return** nó sẽ trả về giá trị cuối cùng

```ruby
def test
  a = 1
  b = 2
  c = "test"

  return a, b, c
end

puts test

# 1
# 2
# test
```
- Có thể return nhiều giá trị với nhiều kiểu dữ liệu khác nhau 

### Variable Number of Parameters
Có thể truyền nhiều biến với số lương không xác định trước bằng từ khóa `*`
```ruby
def test(*args)
  puts "Length of args: #{args.length}"
  for arg in args
    puts arg
  end
end

test(1, 2, "c")

# Length of args: 3
# 1
# 2
# c
```

### Class Methods vs Instance Methods
```ruby
class Accounts
    # Instance method
    def reading_charge
        puts "Reading charge"
    end
    # Class method
    def Accounts.return_date
        puts "Return date"
    end
end

a = Accounts.new
a.reading_charge

Accounts.return_date
```

- **Class methods** được khai báo bằng từ khóa `def` + `ClassName.method_name`
- Gọi trực tiếp bằng tên `class`

```python 
class test:
    @class_method
    def class_method_name_func(args):
        pass
```

```java
class Test:
    public static <type> class_method_name(args) {
    }
```

### alias Statement
Đặt bí danh cho hàm, chỉ tham chiếu đến hàm đó, không làm mất

```ruby
class Accounts
   def reading_charge
      puts "Reading charge"
   end
   def Accounts.return_date
      puts "Return date"
   end

   alias abc reading_charge
end

a = Accounts.new
a.reading_charge
a.abc

Accounts.return_date
```

### undef Statement
Dùng để vô hiệu hóa của `class/module`

```ruby
class Accounts
   def reading_charge
      puts "Reading charge"
   end
   def Accounts.return_date
      puts "Return date"
   end

   undef reading_charge
end

a = Accounts.new
a.reading_charge

Accounts.return_date

# main.rb:13:in `<main>': undefined method `reading_charge' for an instance of Accounts (NoMethodError)

# a.reading_charge
```

## Blocks
**Blocks** là 1 đoạn `code` được truyền vào phương thức để thực thi
```ruby
test { puts "Hello, World!" }
```

- Để gọi nó trong phương thức cần sử dụng từ kháo `yield` và tên của **block** phải trùng với tên phương thức
- Chuyển **block** thành `Proc` **Object** dùng để lưu trữ truyền đi nhiều lần

## Modules and Mixins
### Modules
**Modules** là cách nhóm các `methods`, `classes`, `contants` lại với nhau

```ruby
# trig.rb
module Trig
   PI = 3.141592654
   def Trig.sin(x)
   end
   def Trig.cos(x)
   end
end
```
Import **modules**

```ruby
# main.rb
require "trig.rb"
# require_relative "trig.rb"

put Trig::PI
# 3.141592654
```
- **Modules** được **import** thông qua từ khóa `require` hoặc `require_relative` đối với vị trí tương đối
- `class`, `constants` được gọi thông qua từ khóa `::`

### Mixins
**Mixins** là cách trộn các phương thức và hằng số của **modules** vào **class** để tái sử dụng code
```ruby
module Cah
    def print_one
        puts 1
    end
end

module Mah
    PI = 3.1415926535897932384626433832795
    def Mah.helloworld
        puts "print"
    end

    class MahClass
        def print_pi
            puts PI
        end
        include Cah
    end
end
```

```ruby
require_relative "module.rb"

puts Mah::PI

puts Mah::MahClass.new.print_pi

Mah.helloworld

Mah::MahClass.new.print_one
```
- Sử dụng từ khóa `include` để gọi **module** vào **class**

## Strings
Có 2 cách để tạo **string** trong **Ruby**

```ruby
a = "abc"
b = String.new("abc")

# same object
puts a.equal?b

# same value
puts a === b

# false
# true
```

- **unpack** dùng để chuyển đối **String** sang **Array**

```ruby
"abc \0\0abc \0\0".unpack('A6Z6')   #=> ["abc", "abc "]
```
- **A**: xóa các ký tự `space` và `null`
- **Z**: Kéo dài đến ký tự `null` đầu tiên

## Date & Time
Cú pháp cơ bản
```ruby
time = Time.new
puts time.inspect

puts "Year:" + time.year.to_s
puts "Month:" + time.month.to_s
puts "Day:" + time.day.to_s
puts "Hour:" + time.hour.to_s
puts "Minute:" + time.min.to_s
puts "Second:" + time.sec.to_s

puts "Time format:" + time.strftime("%Y-%m-%d %H:%M:%S")
```

```
2025-08-08 11:18:33.294208038 +0700
Year:2025
Month:8
Day:8
Hour:11
Minute:18
Second:33
Time format:2025-08-08 11:18:33
```

## Iterators
### each Iterator
```ruby
ary = [1,2,3,4,5]
ary.each do |i|
   puts i
end
```
Đây là cách duyệt mảng cơ bản

### collect Iterator
**collect** duyệt qua từng phần tử của một mảng và trả về mảng mới chứa kết quả của khối lệnh được truyền vào
```ruby
nums = [1, 2, 3, 4]
squares = nums.collect { |n| n * n }

p squares 
p nums    
```

## File I/O
Cú pháp để thao tác với **File** của **Ruby** rất gần gũi 
### gets Statement
**gets** lấy input từ user từ STDIN

```ruby
puts "Enter a value :"
val = gets
puts val

# Enter number:
# 69
# Number is 69
```

### putc Statement
**putc** in kí tự đầu tiên gặp được
```ruby
val = "Tra Bong"

putc val

# T
```

### print Statement
**print** giống **puts** nhưng không xuống dòng
```ruby
val1 = "Tra Bong"
val1 = "Cha Bong"

print val1
print val2

# Tra BongCha Bong
```

### Create new File
Có thể sử dụng các cách sau
- Tạo file nhưng phải tự đóng

```ruby
f = File.open("test.txt", "w")
  f.write("Hello World")
f.close
```

- Tạo file, tự động đóng

```ruby
File.open("test.txt", "w") do |f|
  f.write("Hello World")
end
```

### Read a File
- Đọc toàn bộ file

```ruby
File.open("test.txt", "r") do |f|
  puts f.read
end
```
- Đọc theo từng dòng

```ruby
File.open("test.txt", "r") do |f|
  f.each_line do |line|
    puts line
  end
end
```

- Đọc theo số lượng ký tự

```ruby
File.open("test.txt", "r") do |f|
  puts f.read(4)
end
```

### Rename a File
```ruby
File.rename("file1.txt", "file2.txt")
```

### Delete a File
```ruby
File.delete("test2.txt")
```

### Change File mode
```ruby
file = File.new( "test.txt", "w" )
file.chmod( 0755 )
```

### File Inquiries
- Kiểm tra **file** có tồn tại trước khi ở

```ruby
File.open("file.rb") if File::exists?( "file.rb" )
```

- Kiểm tra nó thật sự là **file** hay không

```ruby
File.file?( "text.txt" )
```

- Kiểm tra nó thật sự là **directory** hay không

```ruby
# a directory
File::directory?( "/usr/local/bin" ) # => true

# a file
File::directory?( "file.rb" ) # => false
```

- Kiểm tra **mode** của **file**

```ruby
File.readable?( "test.txt" )   # => true
File.writable?( "test.txt" )   # => true
File.executable?( "test.txt" ) # => false
```

- Kiểm tra kích thước **file**

```ruby
File.size?( "text.txt" )
```

- Kiểm tra **file type**

```ruby
File::ftype( "test.txt" )  
```

- Kiểm tra thời gian tạo, thay đổi, truy cập **file**

```ruby
File::ctime( "test.txt" )
File::mtime( "text.txt" )
File::atime( "text.txt" )
```

### Directories
- Di chuyển thư mục làm việc

```ruby
Dir.chdir("/usr/bin")

# Get working directory
puts Dir.pwd
```

- Hiển thị tất cả thư mục và file tại được dẫn cụ thể

```ruby
puts Dir.entries("/usr/bin")

# or

Dir.foreach("/home/waibui") do |entry|
   puts entry
end
```

- Tạo **directory** mới

```ruby
Dir.mkdir("mynewdir")

# With mode
Dir.mkdir( "mynewdir", 755 )
```

- Xóa **directory**

```ruby
Dir.delete("testdir")
```

- **Temporary files** là tệp chỉ tồn tại trong thời gian chương trình chạy, sau khi chương trình kết thúc hoặc không cần dùng nữa, tệp sẽ bị xóa.

```ruby
require 'tmpdir'

tempfilename = File.join(Dir.tmpdir, "tingtong")
tempfile = File.new(tempfilename, "w")   # create file
tempfile.puts "This is a temporary file" # write content
tempfile.close                           # close file
File.delete(tempfilename)                # delete file
```

## Exceptions
**Exception** là cơ chế xử lý lỗi giúp dừng luồng thực thi bình thường khi có sự cố, nhảy sang khối xử lý lỗi, và có thể tiếp tục chạy chương trình.

```ruby
begin  
# -  
rescue OneTypeOfException  
# -  
rescue AnotherTypeOfException  
# -  
else  
# Other exceptions
ensure
# Always will be executed
end
```

### retry Statement
Thử lại tại `begin` nếu có **exception** xảy ra
```ruby
tries = 0

begin
  tries += 1
  puts "Attempt #{tries}"
  raise "Simulated error" if tries < 3
rescue
  retry if tries < 3
end

puts "Completed!"
```

### raise Statement
Quăng ra một **exception** tự tạo
```ruby
class MyCustomError < StandardError; end

raise MyCustomError, "This is my custom error"
```

### ensure Statement
**ensure** luôn chạy, bất kể có lỗi hay không
```ruby
begin
  puts "Enter a number:"
  num = Integer(gets)
  result = 10 / num
  puts "Result: #{result}"
rescue ZeroDivisionError
  puts "Cannot divide by zero!"
rescue ArgumentError
  puts "That’s not a valid number!"
else
  puts "No errors occurred."
ensure
  puts "This always runs (cleanup, close files, etc.)"
end
```

### Catch and Throw
**catch** và **throw** không giống với `begin/rescue` dùng để xử lý ngoại lệ. Chúng được dùng để nhảy ra khỏi một đoạn **code** lồng nhau (non-local jump) mà không tạo ra **exception**.

```ruby
catch(:xong) do
  puts "Bắt đầu"

  throw(:xong)  # Nhảy ra ngay lập tức

  puts "Dòng này sẽ không bao giờ chạy"
end

puts "Sau khối catch"
```

## Object Oriented
### Getter - Setter
```ruby
class User
  def initialize(name, email)
    @name = name
    @email = email
  end

  def get_name
    @name
  end

  def get_email
    @email
  end

  def set_name(name)
    @name = name
  end

  def set_email(email)
    @email = email
  end
end

u1 = User.new("John", "j@j.com")

puts u1.get_name
puts u1.get_email

u1.set_name("Jane")
u1.set_email("jav@.com")

puts u1.get_name
puts u1.get_email
```

```
John
j@j.com
Jane
jav@.com
```

### to_s Method
Một **class** được định nghĩa nên có **to_s** instace method trả về object ở dạng chuỗi

```ruby
class User
  def initialize(name, email)
    @name = name
    @email = email
  end

  def to_s
    "Name: #{@name}, Email: #{@email}"
  end
end

u1 = User.new("John", "j@j.com")

puts u1.to_s
```

### Access Control
**Ruby** cung cấp cho bạn ba cấp độ bảo vệ ở cấp độ phương thức thể hiện: **public**, **private**, hoặc **protected**.
```ruby
class Box
   # constructor method
   def initialize(w,h)
      @width, @height = w, h
   end

   # instance method by default it is public
   def getArea
      getWidth() * getHeight
   end

   # define private accessor methods
   def getWidth
      @width
   end
   def getHeight
      @height
   end
   # make them private
   private :getWidth, :getHeight

   # instance method to print area
   def printArea
      @area = getWidth() * getHeight
      puts "Big box area is : #@area"
   end
   # make it protected
   protected :printArea
end

# create an object
box = Box.new(10, 20)

# call instance methods
a = box.getArea()
puts "Area of the box is : #{a}"

# try to call protected or methods
box.printArea()
```

### Inheritance
Tương tự các ngôn ngữ lập trình khác, **Ruby** cũng có tính kế thừa, sử dụng kí tự `<`

```ruby
class Box
   # constructor method
   def initialize(w,h)
      @width, @height = w, h
   end
   # instance method
   def getArea
      @width * @height
   end
end

# define a subclass
class BigBox < Box

   # add a new instance method
   def printArea
      @area = @width * @height
      puts "Big box area is : #@area"
   end
end

# create an object
box = BigBox.new(10, 20)

# print the area
box.printArea()
```