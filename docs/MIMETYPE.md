# Supported Mime Type by the REST flow

The REST flow supports various MIME types for data exchange between connectors and resources. This document outlines the supported MIME types, their descriptions, and the flows in which they are applicable.

## Limit size

Currently, the maximum size for the different mimes types are configurable through the following config variables:
* `expressLimitSize`

The size is common to all mime types and defaults to `2mb` if not specified.

## Configuration

To use a specific MIME type in the REST flow, you can configure it in the resource from the catalog. Navigate to the resource settings and specify the desired MIME type.

## Default management

By default, during the exchange if no MIME type is specified, the system will use `application/json` as the default MIME type for data exchange.

This ensures compatibility and ease of integration across different connectors and resources.

If the resource does not support `application/json`, the system will stop the exchange if the checksum, content length and content type are not aligned.

## Supported Mime Types

The following table lists the supported MIME types along with their descriptions:

| MIME Type                | Description                       | Flow                             |
|--------------------------|-----------------------------------|----------------------------------|
| application/json         | JavaScript Object Notation (JSON) | service chain, standard, consent |
| application/pdf          | Portable Document Format (PDF)    | standard                         |
| application/octet-stream | Binaries  (BIN)                   | standard                         |
| text/csv                 | Comma-Separated Values (CSV)      | standard                         |
| text/plain               | Pure text                         | standard                         |

## Expected requests format from connector to resource

As a consumer your connector should send the requests in the following format during an exchange at your resource url:

<details>
<summary>Example body and headers for JSON data: `application/json`</summary>

  **Header**:
  ```json
  {
    "accept": "application/json, text/plain, */*",
    "content-type": "application/json",
    "x-ptx-incomingdataspaceconnectoruri": "http://host.docker.internal:3334/",
    "x-ptx-dataexchangeid": "6928befdf59ce061a16441f8",
    "x-ptx-contractid": "691f16068c05c88700ea118e",
    "x-ptx-contracturl": "http://host.docker.internal:8888/contracts/691f16068c05c88700ea118e",
    "user-agent": "axios/1.7.2",
    "content-length": "5917",
    "accept-encoding": "gzip, compress, deflate, br",
    "host": "localhost:3321",
    "connection": "keep-alive"
  }
  ```
  
  **Body**
  ```json
  [
    {
      "_id": "65d8bd52e8f539675cd16156",
      "email": "participant+1@email.com",
      "__v": 0,
      "schema_version": "1",
      "updatedAt": "2024-03-07T14:18:08.700Z",
      "verified_email": true,
      "skills": "[]"
    },
    {
      "_id": "65646d4320ec42ff2e719706",
      "email": "participant+1@email.com",
      "verified_email": true,
      "schema_version": "1",
      "createdAt": "2024-02-22T14:52:04.389Z",
      "updatedAt": "2025-11-10T10:45:01.094Z",
      "__v": 0,
      "skills": [
        "[\"office suite\", \"windows\"]"
      ]
    }
  ]
  ```
</details>

<details>
<summary>Example body and headers for PDF data: `application/pdf`</summary>

**Header**:
```json
{
  "accept": "application/json, text/plain, */*",
  "content-type": "application/pdf",
  "x-ptx-incomingdataspaceconnectoruri": "http://host.docker.internal:3334/",
  "x-ptx-dataexchangeid": "6928c069f59ce061a1644221",
  "x-ptx-contractid": "691f16068c05c88700ea118e",
  "x-ptx-contracturl": "http://host.docker.internal:8888/contracts/691f16068c05c88700ea118e",
  "user-agent": "axios/1.7.2",
  "content-length": "10235",
  "accept-encoding": "gzip, compress, deflate, br",
  "host": "localhost:3321",
  "connection": "keep-alive"
}
```

**Body**
```pdf
%PDF-1.3\n%����\n7 0 obj\n<<\n/Type /Page\n/Parent 1 0 R\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n
/Resources 6 0 R\n>>\nendobj\n6 0 obj\n<<\n/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n/Font <<\n/F1 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n
5 0 obj\n<<\n/Length 467\n/Filter /FlateDecode\n>>\nstream\nx�홽��0\u0010��<�_�����-��@��\u000ei;D��vW�����\u0005\u0016�$t%1�'�|���h\"�\u000b�')\\�
iY_�\u001f�\f����P�*\u0013���$W\n�ryY>|�\"(�����+,\u0003�\bl�ʾ⚊�����ܟ�\u000b/�/˧���oVS\u000b���okz���\u001b�t+�{�?SNC�~@�O�*�pŖ���wiF�\u000b�w=hi04
lHe\u0004�]�v.�rR�~��ܺ\u001e��sy�(�~0#�\\���@�fW��&�\u001bW~o\u001a�\u0014C\u0016����&��{����\\N?\u0017ѽX��4$��\u0007�'��\u0004����\u001b�Ƕ*g`M\b~�
z�□���ݍ��A�R&�g/�\u001a�d�\t���#�����{����O\u0007߂��U�दÕ�\r�7'��\u0000\u001e\u001c�\u0003d2}��4ֿ��W'��?�.LUg�oՈ�/��F:����]�1}�g�\u0014����5�>���5��
���ÏJjӷ{�N6\u001d{\u0001���GY)���%cv�\u0002!\u0019�\u001cG\u0007oFV���D�\u001f?��߄\u0012ӷz�T�1�?��\u0015%���\nendstream\nendobj\n11 0 obj\n<<\n/Typ
e /Page\n/Parent 1 0 R\n/MediaBox [0 0 612 792]\n/Contents 9 0 R\n/Resources 10 0 R\n>>\nendobj\n10 0 obj\n<<\n/ProcSet [/PDF /Text /ImageB /ImageC
 /ImageI]\n/Font <<\n/F1 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n9 0 obj\n<<\n/Length 445\n/Filter /FlateDecode\n>>\nstream\nx��X;��0\u0010�u\n^
���Β��\"@R�\u000b�.H�'w������\u00038�+�Vt'����V\u001a�\u0014.\\NR�dӲ�/�\u0016\u0019l�/\u000f��Ԓ\"d���}��U�h�\\�\u001fg�pME�M\u0019-9-�׎+n����ҕ!xC��
\f�\u0015{\u001a\u0002�ޭ\u0019}/\u0004�����а#�\u0011�n>����Y9���s�~�S�r�(�~0#m-}�|�[���o!�\u0007W^\u000b�,�o˗���\u001fڀ�\u0014���ۀ�^H����\u000b_�ɹ�
�,����:Ӑ�\u001f)�ޭ\u000f;�q'�\u001e�Qܦ��-�����{\u0016�\u0016m�`<����j4J������0\u001b�ZIbx�\u0003_�t\u0018��c\u001f\u0015\u00146<�a\u001f�\u0004\f\u
001f����Nm��\u000f\u0013b�n���xz�絑�lt�!�:=�sO�2\u001b�se����\f�m�-+yL��\fN1J\u001dG\u0007�@/}�T��J����\u0016�:=�Z�lT:�\u000e~\u0018��g{j�r�:�\u000
e�\b��O��Jө��L���=\tP�R����J/�E��t\u001c\u001c��$~p��\u001bK\u000e�>\nendstream\nendobj\n14 0 obj\n<<\n/Type /Page\n/Parent 1 0 R\n/MediaBox [0 0 6
12 792]\n/Contents 12 0 R\n/Resources 13 0 R\n>>\nendobj\n13 0 obj\n<<\n/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n/Font <<\n/F1 8 0 R\n>>\n/Co
lorSpace <<\n>>\n>>\nendobj\n12 0 obj\n<<\n/Length 434\n/Filter /FlateDecode\n>>\nstream\nx�혽n�@\u0010�{�b_����Ϯt�\"R\\��D\u0017��й��7�rvt\u0012��
a�\u0002�a�~�2�\u0014.\\��pɦey�~Or�}�߄RRK��U/����Y�h����\u0005\u000b\u0002������-�Z�����\"�\\tQ��!������E�\u001fӕ!xA��z�5��\u001e�ފT��\u001d]���Z\u
0006���Y\u0017����(\f\u0001s�a�\u000bc�\u0016�U��ӷy��Q�pH�w���A�4-o��}��aú�g�]��u?�8��6�kA\u000f��X�ņU�.�\u001eB����.�nj�]��V\u0001�\u0012u4�������
$t4���|X���\n\n�`�#*�\u001b��w�c\u0015��^�$\u000f+~8�ld<Z��\u0019\u0014ów\b����\u00195\u001f��se�\u001cm׷�d:|�gYɏ\u001b���\u0007S���\u0019h�\u0001�
q#n��\u0005�q�qr��$\u001f~��0�q�qv�\u001aT\u001f�]\u0015�6�O�T'}���Lv�u�\u001d�+��o�D+�Ǟ�X�o�j�\u001cG\u001d�5�?�\u000f�P\nendstream\nendobj\n17 0 
obj\n<<\n/Type /Page\n/Parent 1 0 R\n/MediaBox [0 0 612 792]\n/Contents 15 0 R\n/Resources 16 0 R\n>>\nendobj\n16 0 obj\n<<\n/ProcSet [/PDF /Text /
ImageB /ImageC /ImageI]\n/Font <<\n/F1 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n15 0 obj\n<<\n/Length 445\n/Filter /FlateDecode\n>>\nstream\nx��X
;��0\u0010�u\n^���Β��\"@R�\u000b�.H�'w������\u00038�+�Vt'����V\u001a�\u0014.\\NR�dӲ�/�\u0016\u0019l�/\u000f��Ԓ\"d���}��U�h�\\�\u001fg�pME�M\u0019-9
-�׎+n����ҕ!xC��\f�\u0015{\u001a\u0002�ޭ\u0019}/\u0004�����а#�\u0011�n>����Y9���s�~�S�r�(�~0#m-}�|�[���o!�\u0007W^\u000b�,�o˗���\u001fڀ�\u0014���ۀ�^
H����\u000b_�ɹ��,����:Ӑ�\u001f)�ޭ\u000f;�q'�\u001e�Qܦ��-�����{\u0016�\u0016m�`<����j4J������0\u001b�ZIbx�\u0003_�t\u0018��c\u001f\u0015\u00146<�a\u
001f�\u0004\f\u001f����Nm��\u000f\u0013b�n���xz�絑�lt�!�:=�sO�2\u001b�se����\f�m�-+yL��\fN1J\u001dG\u0007�@/}�T��J����\u0016�:=�Z�lT:�\u000e~\u0018
��g{j�r�:�\u000e�\b��O��Jө��L���=\tP�R����J/�E��t\u001c\u001c��$~p��\u001bK\u000e�>\nendstream\nendobj\n20 0 obj\n<<\n/Type /Page\n/Parent 1 0 R\n/
MediaBox [0 0 612 792]\n/Contents 18 0 R\n/Resources 19 0 R\n>>\nendobj\n19 0 obj\n<<\n/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n/Font <<\n/F1
 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n18 0 obj\n<<\n/Length 434\n/Filter /FlateDecode\n>>\nstream\nx�혽n�@\u0010�{�b_����Ϯt�\"R\\��D\u0017��й
��7�rvt\u0012��a�\u0002�a�~�2�\u0014.\\��pɦey�~Or�}�߄RRK��U/����Y�h����\u0005\u000b\u0002������-�Z�����\"�\\tQ��!������E�\u001fӕ!xA��z�5��\u001e�ފT
��\u001d]���Z\u0006���Y\u0017����(\f\u0001s�a�\u000bc�\u0016�U��ӷy��Q�pH�w���A�4-o��}��aú�g�]��u?�8��6�kA\u000f��X�ņU�.�\u001eB����.�nj�]��V\u0001�
\u0012u4�������$t4���|X���\n\n�`�#*�\u001b��w�c\u0015��^�$\u000f+~8�ld<Z��\u0019\u0014ów\b����\u00195\u001f��se�\u001cm׷�d:|�gYɏ\u001b���\u0007S���
\u0019h�\u0001�q#n��\u0005�q�qr��$\u001f~��0�q�qv�\u001aT\u001f�]\u0015�6�O�T'}���Lv�u�\u001d�+��o�D+�Ǟ�X�o�j�\u001cG\u001d�5�?�\u000f�P\nendstream
\nendobj\n23 0 obj\n<<\n/Type /Page\n/Parent 1 0 R\n/MediaBox [0 0 612 792]\n/Contents 21 0 R\n/Resources 22 0 R\n>>\nendobj\n22 0 obj\n<<\n/ProcSe
t [/PDF /Text /ImageB /ImageC /ImageI]\n/Font <<\n/F1 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n21 0 obj\n<<\n/Length 445\n/Filter /FlateDecode\n>
>\nstream\nx��X;��0\u0010�u\n^���Β��\"@R�\u000b�.H�'w������\u00038�+�Vt'����V\u001a�\u0014.\\NR�dӲ�/�\u0016\u0019l�/\u000f��Ԓ\"d���}��U�h�\\�\u001f
g�pME�M\u0019-9-�׎+n����ҕ!xC��\f�\u0015{\u001a\u0002�ޭ\u0019}/\u0004�����а#�\u0011�n>����Y9���s�~�S�r�(�~0#m-}�|�[���o!�\u0007W^\u000b�,�o˗���\u001
fڀ�\u0014���ۀ�^H����\u000b_�ɹ��,����:Ӑ�\u001f)�ޭ\u000f;�q'�\u001e�Qܦ��-�����{\u0016�\u0016m�`<����j4J������0\u001b�ZIbx�\u0003_�t\u0018��c\u001f\u0
015\u00146<�a\u001f�\u0004\f\u001f����Nm��\u000f\u0013b�n���xz�絑�lt�!�:=�sO�2\u001b�se����\f�m�-+yL��\fN1J\u001dG\u0007�@/}�T��J����\u0016�:=�Z�lT
:�\u000e~\u0018��g{j�r�:�\u000e�\b��O��Jө��L���=\tP�R����J/�E��t\u001c\u001c��$~p��\u001bK\u000e�>\nendstream\nendobj\n26 0 obj\n<<\n/Type /Page\n/
Parent 1 0 R\n/MediaBox [0 0 612 792]\n/Contents 24 0 R\n/Resources 25 0 R\n>>\nendobj\n25 0 obj\n<<\n/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]
\n/Font <<\n/F1 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n24 0 obj\n<<\n/Length 434\n/Filter /FlateDecode\n>>\nstream\nx�혽n�@\u0010�{�b_����Ϯt�\"
R\\��D\u0017��й��7�rvt\u0012��a�\u0002�a�~�2�\u0014.\\��pɦey�~Or�}�߄RRK��U/����Y�h����\u0005\u000b\u0002������-�Z�����\"�\\tQ��!������E�\u001fӕ!xA�
�z�5��\u001e�ފT��\u001d]���Z\u0006���Y\u0017����(\f\u0001s�a�\u000bc�\u0016�U��ӷy��Q�pH�w���A�4-o��}��aú�g�]��u?�8��6�kA\u000f��X�ņU�.�\u001eB����.
�nj�]��V\u0001�\u0012u4�������$t4���|X���\n\n�`�#*�\u001b��w�c\u0015��^�$\u000f+~8�ld<Z��\u0019\u0014ów\b����\u00195\u001f��se�\u001cm׷�d:|�gYɏ\u00
1b���\u0007S���\u0019h�\u0001�q#n��\u0005�q�qr��$\u001f~��0�q�qv�\u001aT\u001f�]\u0015�6�O�T'}���Lv�u�\u001d�+��o�D+�Ǟ�X�o�j�\u001cG\u001d�5�?�\u00
0f�P\nendstream\nendobj\n29 0 obj\n<<\n/Type /Page\n/Parent 1 0 R\n/MediaBox [0 0 612 792]\n/Contents 27 0 R\n/Resources 28 0 R\n>>\nendobj\n28 0 o
bj\n<<\n/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n/Font <<\n/F1 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n27 0 obj\n<<\n/Length 445\n/Filter 
/FlateDecode\n>>\nstream\nx��X;��0\u0010�u\n^���Β��\"@R�\u000b�.H�'w������\u00038�+�Vt'����V\u001a�\u0014.\\NR�dӲ�/�\u0016\u0019l�/\u000f��Ԓ\"d���}
��U�h�\\�\u001fg�pME�M\u0019-9-�׎+n����ҕ!xC��\f�\u0015{\u001a\u0002�ޭ\u0019}/\u0004�����а#�\u0011�n>����Y9���s�~�S�r�(�~0#m-}�|�[���o!�\u0007W^\u00
0b�,�o˗���\u001fڀ�\u0014���ۀ�^H����\u000b_�ɹ��,����:Ӑ�\u001f)�ޭ\u000f;�q'�\u001e�Qܦ��-�����{\u0016�\u0016m�`<����j4J������0\u001b�ZIbx�\u0003_�t\u0
018��c\u001f\u0015\u00146<�a\u001f�\u0004\f\u001f����Nm��\u000f\u0013b�n���xz�絑�lt�!�:=�sO�2\u001b�se����\f�m�-+yL��\fN1J\u001dG\u0007�@/}�T��J���
�\u0016�:=�Z�lT:�\u000e~\u0018��g{j�r�:�\u000e�\b��O��Jө��L���=\tP�R����J/�E��t\u001c\u001c��$~p��\u001bK\u000e�>\nendstream\nendobj\n32 0 obj\n<<\
n/Type /Page\n/Parent 1 0 R\n/MediaBox [0 0 612 792]\n/Contents 30 0 R\n/Resources 31 0 R\n>>\nendobj\n31 0 obj\n<<\n/ProcSet [/PDF /Text /ImageB /
ImageC /ImageI]\n/Font <<\n/F1 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n30 0 obj\n<<\n/Length 434\n/Filter /FlateDecode\n>>\nstream\nx�혽n�@\u001
0�{�b_����Ϯt�\"R\\��D\u0017��й��7�rvt\u0012��a�\u0002�a�~�2�\u0014.\\��pɦey�~Or�}�߄RRK��U/����Y�h����\u0005\u000b\u0002������-�Z�����\"�\\tQ��!����
��E�\u001fӕ!xA��z�5��\u001e�ފT��\u001d]���Z\u0006���Y\u0017����(\f\u0001s�a�\u000bc�\u0016�U��ӷy��Q�pH�w���A�4-o��}��aú�g�]��u?�8��6�kA\u000f��X�ņU
�.�\u001eB����.�nj�]��V\u0001�\u0012u4�������$t4���|X���\n\n�`�#*�\u001b��w�c\u0015��^�$\u000f+~8�ld<Z��\u0019\u0014ów\b����\u00195\u001f��se�\u001
cm׷�d:|�gYɏ\u001b���\u0007S���\u0019h�\u0001�q#n��\u0005�q�qr��$\u001f~��0�q�qv�\u001aT\u001f�]\u0015�6�O�T'}���Lv�u�\u001d�+��o�D+�Ǟ�X�o�j�\u001cG
\u001d�5�?�\u000f�P\nendstream\nendobj\n35 0 obj\n<<\n/Type /Page\n/Parent 1 0 R\n/MediaBox [0 0 612 792]\n/Contents 33 0 R\n/Resources 34 0 R\n>>\
nendobj\n34 0 obj\n<<\n/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n/Font <<\n/F1 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n33 0 obj\n<<\n/Lengt
h 445\n/Filter /FlateDecode\n>>\nstream\nx��X;��0\u0010�u\n^���Β��\"@R�\u000b�.H�'w������\u00038�+�Vt'����V\u001a�\u0014.\\NR�dӲ�/�\u0016\u0019l�/\
u000f��Ԓ\"d���}��U�h�\\�\u001fg�pME�M\u0019-9-�׎+n����ҕ!xC��\f�\u0015{\u001a\u0002�ޭ\u0019}/\u0004�����а#�\u0011�n>����Y9���s�~�S�r�(�~0#m-}�|�[���
o!�\u0007W^\u000b�,�o˗���\u001fڀ�\u0014���ۀ�^H����\u000b_�ɹ��,����:Ӑ�\u001f)�ޭ\u000f;�q'�\u001e�Qܦ��-�����{\u0016�\u0016m�`<����j4J������0\u001b�ZI
bx�\u0003_�t\u0018��c\u001f\u0015\u00146<�a\u001f�\u0004\f\u001f����Nm��\u000f\u0013b�n���xz�絑�lt�!�:=�sO�2\u001b�se����\f�m�-+yL��\fN1J\u001dG\u0
007�@/}�T��J����\u0016�:=�Z�lT:�\u000e~\u0018��g{j�r�:�\u000e�\b��O��Jө��L���=\tP�R����J/�E��t\u001c\u001c��$~p��\u001bK\u000e�>\nendstream\nendobj
\n38 0 obj\n<<\n/Type /Page\n/Parent 1 0 R\n/MediaBox [0 0 612 792]\n/Contents 36 0 R\n/Resources 37 0 R\n>>\nendobj\n37 0 obj\n<<\n/ProcSet [/PDF 
/Text /ImageB /ImageC /ImageI]\n/Font <<\n/F1 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n36 0 obj\n<<\n/Length 434\n/Filter /FlateDecode\n>>\nstrea
m\nx�혽n�@\u0010�{�b_����Ϯt�\"R\\��D\u0017��й��7�rvt\u0012��a�\u0002�a�~�2�\u0014.\\��pɦey�~Or�}�߄RRK��U/����Y�h����\u0005\u000b\u0002������-�Z����
�\"�\\tQ��!������E�\u001fӕ!xA��z�5��\u001e�ފT��\u001d]���Z\u0006���Y\u0017����(\f\u0001s�a�\u000bc�\u0016�U��ӷy��Q�pH�w���A�4-o��}��aú�g�]��u?�8��6
�kA\u000f��X�ņU�.�\u001eB����.�nj�]��V\u0001�\u0012u4�������$t4���|X���\n\n�`�#*�\u001b��w�c\u0015��^�$\u000f+~8�ld<Z��\u0019\u0014ów\b����\u00195\
u001f��se�\u001cm׷�d:|�gYɏ\u001b���\u0007S���\u0019h�\u0001�q#n��\u0005�q�qr��$\u001f~��0�q�qv�\u001aT\u001f�]\u0015�6�O�T'}���Lv�u�\u001d�+��o�D+�
Ǟ�X�o�j�\u001cG\u001d�5�?�\u000f�P\nendstream\nendobj\n41 0 obj\n<<\n/Type /Page\n/Parent 1 0 R\n/MediaBox [0 0 612 792]\n/Contents 39 0 R\n/Resour
ces 40 0 R\n>>\nendobj\n40 0 obj\n<<\n/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]\n/Font <<\n/F1 8 0 R\n>>\n/ColorSpace <<\n>>\n>>\nendobj\n39 0 
obj\n<<\n/Length 310\n/Filter /FlateDecode\n>>\nstream\nx��U�N�0\f��\u0015��\u0017\u001c'>7R�\u0001\t\u00066�n�)/����/�m���\u0006X_�ĉϾ�X���t��dE�޺�
.\u001eb��\u0016�dB\u0016cH}���=�F�B��}\f�b6��*�bl��uƌ�L�\u0012�eaD\\���\n#aF�\u0004E��QS����8(��P�`�P�\u0005��\u0004�AX=�1��\b��t�J�'�Z\u001a�w�\u
0004��C��D���#�'Mo��Խ�A\u0006\u0014\u000b��ˀ�\u0012�\u001a��H��4�l�ۨ�2\u0005���P\\��\n�W�y��\\\u00156E��c�\\]�X%�{3�6�Y�\u0004Cz�UC_p6�\u000fQ\u000
fO�t��\u001c�0\u0002\u000f��\b�\u000e/�lޫI\u0000\u000e�ߣ��s(��{M1p~���\u0006\n+&R\nendstream\nendobj\n43 0 obj\n(PDFKit)\nendobj\n44 0 obj\n(PDFKit
)\nendobj\n45 0 obj\n(D:20251127211938Z)\nendobj\n42 0 obj\n<<\n/Producer 43 0 R\n/Creator 44 0 R\n/CreationDate 45 0 R\n>>\nendobj\n8 0 obj\n<<\n/
Type /Font\n/BaseFont /Helvetica\n/Subtype /Type1\n/Encoding /WinAnsiEncoding\n>>\nendobj\n4 0 obj\n<<\n>>\nendobj\n3 0 obj\n<<\n/Type /Catalog\n/P
ages 1 0 R\n/Names 2 0 R\n>>\nendobj\n1 0 obj\n<<\n/Type /Pages\n/Count 12\n/Kids [7 0 R 11 0 R 14 0 R 17 0 R 20 0 R 23 0 R 26 0 R 29 0 R 32 0 R 35
 0 R 38 0 R 41 0 R]\n>>\nendobj\n2 0 obj\n<<\n/Dests <<\n  /Names [\n]\n>>\n>>\nendobj\nxref\n0 46\n0000000000 65535 f \n0000008978 00000 n \n00000
09113 00000 n \n0000008916 00000 n \n0000008895 00000 n \n0000000226 00000 n \n0000000119 00000 n \n0000000015 00000 n \n0000008798 00000 n \n00000
00979 00000 n \n0000000871 00000 n \n0000000765 00000 n \n0000001711 00000 n \n0000001603 00000 n \n0000001496 00000 n \n0000002433 00000 n \n00000
02325 00000 n \n0000002218 00000 n \n0000003166 00000 n \n0000003058 00000 n \n0000002951 00000 n \n0000003888 00000 n \n0000003780 00000 n \n00000
03673 00000 n \n0000004621 00000 n \n0000004513 00000 n \n0000004406 00000 n \n0000005343 00000 n \n0000005235 00000 n \n0000005128 00000 n \n00000
06076 00000 n \n0000005968 00000 n \n0000005861 00000 n \n0000006798 00000 n \n0000006690 00000 n \n0000006583 00000 n \n0000007531 00000 n \n00000
07423 00000 n \n0000007316 00000 n \n0000008253 00000 n \n0000008145 00000 n \n0000008038 00000 n \n0000008722 00000 n \n0000008636 00000 n \n00000
08661 00000 n \n0000008686 00000 n \ntrailer\n<<\n/Size 46\n/Root 3 0 R\n/Info 42 0 R\n/ID [<2d1564eede8b33e132e2cf753fa4a415> <2d1564eede8b33e132e2cf753fa4a415>]\n>>\nstartxref\n9160\n%%EOF\n
```
</details>

<details>
<summary>Example body and headers for CSV data: `text/csv`</summary>

**Header**
```json
{
  "accept": "application/json, text/plain, */*",
  "content-type": "text/csv",
  "x-ptx-incomingdataspaceconnectoruri": "http://host.docker.internal:3334/",
  "x-ptx-dataexchangeid": "69284e56d18bf784ee2c1427",
  "x-ptx-contractid": "691f16068c05c88700ea118e",
  "x-ptx-contracturl": "http://host.docker.internal:8888/contracts/691f16068c05c88700ea118e",
  "user-agent": "axios/1.7.2",
  "content-length": "9800",
  "accept-encoding": "gzip, compress, deflate, br",
  "host": "localhost:3321",²²
  "connection": "keep-alive"
}
```

**Body**
```csv
id,nom,email,date\n1,Utilisateur 1,user1@example.com,2025-11-27T21:17:37.395Z\n2,Utilisateur 2,user2
@example.com,2025-11-27T21:17:37.395Z\n3,Utilisateur 3,user3@example.com,2025-11-27T21:17:37.395Z\n4,Utilisateur 4,user4@example.com,2025-11-27T21:
17:37.395Z\n5,Utilisateur 5,user5@example.com,2025-11-27T21:17:37.395Z\n6,Utilisateur 6,user6@example.com,2025-11-27T21:17:37.395Z
```
</details>

<details>
<summary>Example body and headers for BIN data: `application/octet-stream`</summary>

**Header**
```json
{
  "accept": "application/json, text/plain, */*",
  "content-type": "application/octet-stream",
  "x-ptx-incomingdataspaceconnectoruri": "http://host.docker.internal:3334/",
  "x-ptx-dataexchangeid": "6928c0d9f59ce061a164423d",
  "x-ptx-contractid": "691f16068c05c88700ea118e",
  "x-ptx-contracturl": "http://host.docker.internal:8888/contracts/691f16068c05c88700ea118e",
  "user-agent": "axios/1.7.2",
  "content-length": "1024",
  "accept-encoding": "gzip, compress, deflate, br",
  "host": "localhost:3321",
  "connection": "keep-alive"
}
```

**Body**
```bin
F�%�~\t��G\b���=�K8V�63¶ڜD�\u001cp\u001bo\t\u0000@\u000b�2����\u001b�����\u0007��n���m;r�r^Ph��D|�x\
u001b4\u000b\u000b�S\u0013��_�\u0004�M1�c��\u000e�y���\u0015�M���a\u0013�\u0002\u0006\r܅\u0003zB��o��e��&?\\\u0003#�\rK;\b�Ăa:H6������\u0007\u0005�
\u0003\u0000b�Q��u5��\u00194BC\u0013$.��v��\u0001��J �GD�+9l�\u001a�\r��\u0013թ�7y�re���Ӡ\td���ޱ\u001cO&���T,\u00122;\u001b\u001e�n0-Y\u0002�PW��\u
0010��9X��V��}ZP\u0010\fb{I��&��\nf/Dti�y��\u0010�_��᫃�\u0015xoI�'\u0002�6�h�o\u000f�7ԡgE�\u000fm_<ģ�j���\u001a�Vg�A�kgS��\\����\u0010�DՀ04����g�b/
���f\u0018\u001dk���ґ~��{H��\u0018�����Ҫ}���+6v�_Y���V\u001ev�^`+]\\B��$D����Õ\u0017��\u0004\r�m{�~�\ft��\u001c)���J���kA7�9q�,\u001a�m,~K���y�_?��
\u000b�^�:�J\r?�U�G\u0002\u0010 ���\u0016�i��\\\u0013\u0002�� �\u0017vB6TĜ�F,�e�����ja�8z�\u0011�2�\u0004Of�iS5v��A6�\u0012\u001f*欵c�̻��]E��\u0006
\u0012qi���$��\"I��.�?�\u0012��6PB�}����\u0015j�ף�\u001dS��C�b�\u000eQ���(6KY3�@�R�Q\u0005���^Ÿ�-\t��!=f2�k���U/�_�\u0002�-#S��5\u0001��\u001f�?�_�
:�{q���n��3�7���\u0007��|�g\u0005�2���m�j\u0010\u001f��'�\u001f���H�\u0017�A�C�\r��\r��Qp�\u001b�\u0005F�\u0018ԅ��ڌ5tB�p�MF���x4NT#j��\u0005���4\u0
010hoؾ��N���D �\n�Gu\bT��ʓ.�C\u0016\u000fF���͔\u001c\u000e��:[�������WnEPV\f��\u0005���$�\u001d��])�C[�ࡇU��@�8��&�\\@�r�����|�ǎ\u001e$<��\u0012\u00
12l�6H�?�����\u0002�\f�\"8�A\u0011�\u000e�\u0017,s��\u0007\u0016c�m��\u0013\u000f5�c���n#�;U�q\u0001�}X���焐���~\u000b��5��m�\bl��X�\u00197D/�I�\u001c \f��\u001e�8��M\bm��\u001b�/��\u00016��ܠ\u0018�\u0018�I\u0013�~�\u001ei,'ۢ��ZͼQ~���:,\t�Q��\u0013b��N�o����7G�,/\\3���
```
</details>

<details>
<summary>Example body and headers for BIN data: `text/plain`</summary>

**Header**
```json
{
  "accept": "application/json, text/plain, */*",
  "content-type": "text/plain",
  "x-ptx-incomingdataspaceconnectoruri": "http://host.docker.internal:3334/",
  "x-ptx-dataexchangeid": "6928c0d9f59ce061a164423d",
  "x-ptx-contractid": "691f16068c05c88700ea118e",
  "x-ptx-contracturl": "http://host.docker.internal:8888/contracts/691f16068c05c88700ea118e",
  "user-agent": "axios/1.7.2",
  "content-length": "1024",
  "accept-encoding": "gzip, compress, deflate, br",
  "host": "localhost:3321",
  "connection": "keep-alive"
}
```

**Body**
```text
CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(255),
                email VARCHAR(255),
                date TIMESTAMP
            );

INSERT INTO users (id, nom, email, date) VALUES
(1, 'User 1', 'user1@example.com', '2025-12-01T16:47:30.789Z');
```
</details>

## Expected requests format from connector to connector

During the exchange between connectors, the provider connector will send the data in the format specified by the consumer connector.

<details>
<summary>Example body and headers for JSON data: `application/json`</summary>

**Header**
```json
{
  "accept": "application/json, text/plain, */*",
  "content-type": "application/json",
  "x-provider-data-exchange": "6928c396887da2d5e8072df0",
  "user-agent": "axios/1.7.2",
  "content-length": "1024",
  "accept-encoding": "gzip, compress, deflate, br",
  "host": "host.docker.internal:3333",
  "connection": "keep-alive"
}
```
**Body**
```json
{
  "providerDataExchange": "6928c396887da2d5e8072df0",
  "data": "your-data",
  "apiResponse": "apiResponseRepresentation"
}
```
</details>

<details>
<summary>Example body and headers for PDF data: `application/pdf`</summary>

**Header**
```json
{
  "accept": "application/json, text/plain, */*",
  "content-type": "application/pdf",
  "x-provider-data-exchange": "6928c201d962bd14b658ae37",
  "user-agent": "axios/1.7.2",
  "content-length": "9800",
  "accept-encoding": "gzip, compress, deflate, br",
  "host": "host.docker.internal:3333",
  "connection": "keep-alive"
}
```
**Body**: `Buffer`
</details>

<details>
<summary>Example body and headers for CSV data: `text/csv`</summary>

**Header**
```json
{
  "accept": "application/json, text/plain, */*",
  "content-type": "text/csv",
  "x-provider-data-exchange": "6928c201d962bd14b658ae37",
  "user-agent": "axios/1.7.2",
  "content-length": "9800",
  "accept-encoding": "gzip, compress, deflate, br",
  "host": "host.docker.internal:3333",
  "connection": "keep-alive"
}
```
**Body**: `Buffer`
</details>

<details>
<summary>Example body and headers for BIN data: `application/octet-stream`</summary>

**Header**
```json
{
  "accept": "application/json, text/plain, */*",
  "content-type": "application/octet-stream",
  "x-provider-data-exchange": "6928c201d962bd14b658ae37",
  "user-agent": "axios/1.7.2",
  "content-length": "9800",
  "accept-encoding": "gzip, compress, deflate, br",
  "host": "host.docker.internal:3333",
  "connection": "keep-alive"
}
```

**Body**: `Buffer`
</details>

<details>
<summary>Example body and headers for Pure text data: `text/plain`</summary>

**Header**
```json
{
  "accept": "application/json, text/plain, */*",
  "content-type": "text/plain",
  "x-provider-data-exchange": "6928c201d962bd14b658ae37",
  "user-agent": "axios/1.7.2",
  "content-length": "9800",
  "accept-encoding": "gzip, compress, deflate, br",
  "host": "host.docker.internal:3333",
  "connection": "keep-alive"
}
```

**Body**:
```text
CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                nom VARCHAR(255),
                email VARCHAR(255),
                date TIMESTAMP
            );

INSERT INTO users (id, nom, email, date) VALUES
(1, 'User 1', 'user1@example.com', '2025-12-01T16:47:30.789Z');
```
</details>