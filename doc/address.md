# Address API Spec

## Create Address

Endpoint : POST /api/contacts/:contactId/addresses

Headers :
- Authorization: token

Request Body :

```json
{
  "street" : "Jalan Contoh, optional",
  "city" : "Kota, optional",
  "province" : "Provinsi, optional",
  "country" : "Negara Apa",
  "postalCode" : "123123" 
}
```

Response Body

```json
{
  "data" : {
    "id" : "cuid",
    "street" : "Jalan Contoh, optional",
    "city" : "Kota, optional",
    "province" : "Provinsi, optional",
    "country" : "Negara Apa",
    "postalCode" : "123123"
  } 
}
```

## Get Address

Endpoint : GET /api/contacts/:contactId/addresses/:addressId

Headers :
- Authorization: token

Response Body

```json
{
  "data" : {
    "id" : "cuid",
    "street" : "Jalan Contoh, optional",
    "city" : "Kota, optional",
    "province" : "Provinsi, optional",
    "country" : "Negara Apa",
    "postalCode" : "123123"
  } 
}
```

## Update Address

Endpoint : PATCH /api/contacts/:contactId/addresses/:addressId

Headers :
- Authorization: token

Request Body :

```json
{
  "street" : "Jalan Contoh, optional",
  "city" : "Kota, optional",
  "province" : "Provinsi, optional",
  "country" : "Negara Apa",
  "postalCode" : "123123" 
}
```

Response Body

```json
{
  "data" : {
    "id" : "cuid",
    "street" : "Jalan Contoh, optional",
    "city" : "Kota, optional",
    "province" : "Provinsi, optional",
    "country" : "Negara Apa",
    "postalCode" : "123123"
  } 
}
```

## Remove Address

Endpoint : DELETE /api/contacts/:contactId/addresses/:addressId

Headers :
- Authorization: token

Response Body

```json
{
  "data" : true
}
```

## List Addresses

Endpoint : GET /api/contacts/:contactId/addresses

Headers :
- Authorization: token

Response Body

```json
{
  "data" : [
    {
      "id" : "cuid",
      "street" : "Jalan Contoh, optional",
      "city" : "Kota, optional",
      "province" : "Provinsi, optional",
      "country" : "Negara Apa",
      "postalCode" : "123123"
    },
    {
      "id" : "cuid",
      "street" : "Jalan Contoh, optional",
      "city" : "Kota, optional",
      "province" : "Provinsi, optional",
      "country" : "Negara Apa",
      "postalCode" : "123123"
    }
  ]
}
```