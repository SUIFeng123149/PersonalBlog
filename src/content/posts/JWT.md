---
title: "JWT"
published: 2026-08-13
description: "JWT(JSON Web Token)是一种开放标准,它定义了一种紧凑且独立的方式，用于在各方之间以 JSON 对象的形式安全地传输信息，特别适用于分布式站点的单点登录(SSO)场景。JWT的声明一般被用来在身份提供者和服务提供者间传递被认证的用户身份信息（令牌）。此信息可以验证和信任，因为它是经过数字签名的。"
image: ""
tags: ["JWT", "认证", "安全", "Token"]
category: "Spring"
draft: false
featured: false
lang: ""
series: "Java安全系列"
seriesOrder: 1
status: verified
testedOn: ""
lastVerified: 2026-08-13
---

# JWT
## 1. JWT介绍
JWT(JSON Web Token)是一种开放标准,它定义了一种紧凑且独立的方式，用于在各方之间以 JSON 对象的形式安全地传输信息，特别适用于分布式站点的单点登录(SSO)场景。JWT的声明一般被用来在身份提供者和服务提供者间传递被认证的用户身份信息（令牌）。此信息可以验证和信任，因为它是经过数字签名的。

## 2. JWT的应用场景
1. 身份验证(Authentication)：JWT 可以被用作用户登录的身份验证凭证。当用户成功登录后，服务端可以生成一个包含用户信息的JWT，并将其返回给客户端。以后客户端在每次请求时都会携带这个JWT，服务端通过验证 JWT 的签名来确认用户的身份。

2. 授权(Authorization：在用户登录后，服务端可以生成包含用户角色、权限等信息的JWT，并在用户每次请求时进行验证。通过解析 JWT 中的声明信息，服务端可以判断用户是否有权限执行特定的操作或访问特定的资源。

3. 信息交换(information Exchange)：由于JWT 的声明信息可以被加密，因此可以安全地在用户和服务器之间传递信息。这在分布式系统中非常有用，因为可以确保信息在各个环节中的安全传递。

4. 单点登录(Single Sign-On)：JWT 可以被用于支持单点登录，使得用户在多个应用之间只需要登录一次即可使用多个应用，从而提高用户体验。

## 3. JWT的优势
1. 无状态：JWT的验证是基于密钥的，因此它不需要在服务端存储用户信息。这使得JWT可以作为一种无状态的身份认证机制。

2. 跨语言支持：JWT 的标准化和简单性质使得它可以在多种语言和平台之间使用。

3. 安全性高：由于JWT 的载荷可以进行加密处理，因此JWT能够保证数据的安全传输。同时，JWT的签名机制也能够保证数据的完整性和真实性。

Header（头部） JWT 的头部通常由两部分组成，分别是令牌类型(type)和加密算法(alg)。一般情况下，头部会采用Base64URL编码。

Payload（荷载） JWT的负载也是一个 JSON 对象，用来存放实际需要传递的数据JWT 规定了7个官方字段，供选用，包括iss(发行者)、sub(主题)、aud(受众)、exp(过期时间)、nbf(生效时间)、iat(发布时间)、jti(JWT ID)等。

除了官方字段，还可以在这个部分定义私有字段，例如：

```json
{
"sub": "1234567890",
"name":"John Doe",
"admin": true
}
```

注意：Payload中一定不要存放敏感或重要信息，如密码等Signature（签名）Signature 部分是对前两部分的签名，防止数据篁改。

首先，需要指定一个密钥(secret)。这个密钥只有服务器才知道，不能泄露给用户。然后，使用 Header 里面指定的签名算法(默认是HMAC SHA256)，按照下面的公式产生签名。

```txt
HMACSHA256(
base64UrlEncode(header) + "." +
base64UrlEncode(payload),
secret)
算出签名以后，把 Header、Payload、Signature 三个部分拼成一个字符串，每个部分之间用"点"(.)分隔，就可以
```

返回给用户。

Base64URL：Header 和 Payload 串型化的算法是 Base64URL，这个算法跟 Base64算法基本类似，但有一些小的不同，JWT 作为一个令牌(token)，有些场合可能会放到 URL(比如 api.example.com/?token=xxx)。

Base64有三个字符+、/和=，在 URL里面有特殊含义，所以要被替换掉，=被省略，+替换成-，/替换成_ ，这就是 Base64URL算法。

## 4. JWT示例
封装JWT工具类

```java
@Component
public class JwtUtil {

private final SecretKey key;
private final long expireMs;

public JwtUtil(@Value("${jwt.secret}") String secret,
@Value("${jwt.expire-ms}") long expireMs) {
this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
this.expireMs = expireMs;
}

public String createToken(Long userId, String username, Long roleId, List<String> permissions) {
Date now = new Date();
return Jwts.builder()
.subject(username)
.claim("userId", userId)
.claim("roleId", roleId)
.claim("permissions", permissions)
.issuedAt(now)
.expiration(new Date(now.getTime() + expireMs))
.signWith(key)
.compact();
}

public Claims parseToken(String token) {
return Jwts.parser()
.verifyWith(key)
.build()
.parseSignedClaims(token)
.getPayload();
}

public boolean isExpired(Claims claims) {
```

| 字段 | 含义 |
| --- | --- |
| sub | subject 主题，一般放用户名 |
| iat | issued‐at 签发时间 |
| exp | expiration 过期时间 |
| iss | issuer 签发者 |
| aud | audience 受众 |

```txt
return claims.getExpiration().before(new Date());
}
}
```

这里只提供了SHA256的签名算法，如果要使用RSA签名算法或其他签名算法可以自己扩展Claims 是什么Claims 本身就是一个实现了 Map<String,Object> 的对象 ，它继承 Map，所有 Map 的方法它全都有，但是在Map 基础之上增加 JWT 标准规范语义。 JWT 规范定义了一组标准注册声明（Registered Claims）普通 Map 只是一个纯粹 key‐value 容器，没有任何业务含义。

而 Claims 在 Map 的基础上提供专用方法：

```txt
claims.getSubject(); // sub
claims.getIssuedAt(); // iat
claims.getExpiration(); // exp
claims.getIssuer(); // iss
```

如果你用普通 Map，你只能手写：

```txt
Date exp = (Date) map.get("exp");
String sub = (String) map.get("sub");
```

这样就出现了硬编码问题了。

编写测试类测试：

```java
@SpringBootTest
class SwsDemoApplicationTests {
@Autowired
private JwtUtil jwtUtil;
@Test
void createToken() {
List<String> list = new ArrayList<>();
Collections.addAll(list,
```

```java
"permission:query",
"permission:insert",
"permission:update",
"permission:delete",
"permission:check");
String token = jwtUtil.createToken(130L,"tom",
3L,list);
System.out.println(token);
}
@Test
void parseToken() {
String token =
"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b20iLCJ1c2VySWQiOjEzMCwicm9sZUlkIjozLCJwZXJtaXNzaW9ucyI6WyJwZXJtaXNza
W9uOnF1ZXJ5IiwicGVybWlzc2lvbjppbnNlcnQiLCJwZXJtaXNzaW9uOnVwZGF0ZSIsInBlcm1pc3Npb246ZGVsZXRlIiwicGV
ybWlzc2lvbjpjaGVjayJdLCJpYXQiOjE3ODUzMTU0OTksImV4cCI6MTc4NTQwMTg5OX0.LxfGhSLq0dTe-
UMp234ukpWfo210N264F-ocWrfH0Ho";
Claims claims = jwtUtil.parseToken(token);
//2.读取内置标准字段
String username = claims.getSubject(); //subject，对应你代码subject(username)
Date issueAt = claims.getIssuedAt(); //签发时间
Date expire = claims.getExpiration(); //过期时间
System.out.println("用户名 = " + username);
System.out.println("签发时间 = " + issueAt);
System.out.println("过期时间 = " + expire);
//3.读取自定义claim，带类型转换
Long userId = claims.get("userId", Long.class);
Long roleId = claims.get("roleId", Long.class);
System.out.println("userId = " + userId);
System.out.println("roleId = " + roleId);
//List<String>集合读取
List<String> permissions = claims.get("permissions", List.class);
System.out.println("permissions = " + permissions);
}
}
```
