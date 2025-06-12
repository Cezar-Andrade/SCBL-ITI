Sha256 = {
    hash: function(data) {
        var shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.update(data);
        return shaObj.getHash("HEX");
    }
};

qz.security.setCertificatePromise((resolve, reject) => {
    resolve(`-----BEGIN CERTIFICATE-----
MIIECzCCAvOgAwIBAgIGAZcJOd46MA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
EwJVUzELMAkGA1UECAwCTlkxEjAQBgNVBAcMCUNhbmFzdG90YTEbMBkGA1UECgwS
UVogSW5kdXN0cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMx
HDAaBgkqhkiG9w0BCQEWDXN1cHBvcnRAcXouaW8xGjAYBgNVBAMMEVFaIFRyYXkg
RGVtbyBDZXJ0MB4XDTI1MDUyNDIwNTQzNloXDTQ1MDUyNDIwNTQzNlowgaIxCzAJ
BgNVBAYTAlVTMQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYD
VQQKDBJRWiBJbmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMs
IExMQzEcMBoGCSqGSIb3DQEJARYNc3VwcG9ydEBxei5pbzEaMBgGA1UEAwwRUVog
VHJheSBEZW1vIENlcnQwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCB
ybcSBQu3WPJtf83RzWVFdhi+8TBRtfsk8LUD7+BXY1vbACMEflmTAgiHLxhmV/vj
AdK+VTurUwD75S00pJwUsnZgebU1wXoZ3wEF+okYTCXNzhgHCHMAKyP7/Urerf8i
5zyiddAr/Jyns/gHxvllZpp331sKKKv6CK3ad/M+d5e9Mj8NskcLJDREKwL9nGwm
ZzJWHTq/R3aEpnNkeMWEECUh1DExCNO5IOjfqzkLxF5HQ0qAXAubkpciaIkamfns
aYQfrGDZBUuO84l1z3509ImmB1Oo7ZoqGtb1Bhgxwt2xLK0F5aI6M84tpuZIQl7q
VwyDnW23EfXnLPLmYZSrAgMBAAGjRTBDMBIGA1UdEwEB/wQIMAYBAf8CAQEwDgYD
VR0PAQH/BAQDAgEGMB0GA1UdDgQWBBQegRrFGL+eDyPzI01DcmmDinN3kjANBgkq
hkiG9w0BAQsFAAOCAQEARMJ3Bq8wPjR/uKcfmallwVLIYRwgJejdWqSi4oBDj16k
IK415PXyC5oxobJW1XJ3SJJl+tgAxFgnzkMQNFpEnSG9GsWU9P8w5TZJ6nWSswcV
FTqtL+QyqKVnCQLYOQzi1/IXCJXHI3bdk4X9xGzW8UQkRznsyxK5df6YOdDDxe28
cepUP3B7luLoDJ4BkxpZyNpQST50uQSTGpC0ENXuIpCvdbUwHKrY9NLOIxY1TguT
xTjxhuA7nOrUsArzznDd2sj4HXM3oLYVTwuDaBh5E8RDEjXA3S8zfeMFQzuP7U6C
jqUWrCMgGkvPbYhEdpkH009Q2Th7UCFDOGsJpSNLaw==
-----END CERTIFICATE-----`);
});

qz.security.setSignatureAlgorithm("SHA512"); // Since 2.1
qz.security.setSignaturePromise(function(toSign) {
    return function(resolve, reject) {
        try {
            var pk = KEYUTIL.getKey(`-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCBybcSBQu3WPJt
f83RzWVFdhi+8TBRtfsk8LUD7+BXY1vbACMEflmTAgiHLxhmV/vjAdK+VTurUwD7
5S00pJwUsnZgebU1wXoZ3wEF+okYTCXNzhgHCHMAKyP7/Urerf8i5zyiddAr/Jyn
s/gHxvllZpp331sKKKv6CK3ad/M+d5e9Mj8NskcLJDREKwL9nGwmZzJWHTq/R3aE
pnNkeMWEECUh1DExCNO5IOjfqzkLxF5HQ0qAXAubkpciaIkamfnsaYQfrGDZBUuO
84l1z3509ImmB1Oo7ZoqGtb1Bhgxwt2xLK0F5aI6M84tpuZIQl7qVwyDnW23EfXn
LPLmYZSrAgMBAAECggEAFUMnDzgtZbGYMbEk1lCoXRtOTYW0zUYbaT9X4Fe9cIOS
Ckw48GUEpq1IGWFxRV73oIZtcIoFFvmnqRyv7bZj7Y4ZD5AQzEgwiSl8AO8843Ki
JNe1Hv3W3Tm0EPW7fMSTjjPEvra/Tl15io3Uve1ucRrAho/cWcs09WbTmH1bJ6nz
RAGMWhnXwjlrTQbeWl8GU+JUCqU9F26NDcpFtggnlK7dVsaue4xrHhquPifCXe/2
UUT/3uevx/4OErmD0V/yqEmZqJxN09e/R0aBd2uSwrhU2M2f8iSliwm74w4DU7kQ
/Ek/nt0DXQO6ZVNGN/ZxToqEs1b+w0QBHjd24cKsnQKBgQC2h9xd0Hua2HRPuJT0
5ZxbBN/6DVaI5Ru2H1aQMih9Q3tanOFBPla1NbHaahMbbfYX3McSzJgXvcDCFKfZ
+mcfTa+QfqBiKSsSaXcgreGsdciu08EXKhlV5b9s1o9B8/UPiYtyZ53pZhcQAAVl
eYHbg3cJw1amGcuNE0Xfz0xKRQKBgQC2BzCmpq6xumoKnQMSfLtR+gPgpYvLbsM+
fG7QIEdlz4bUeIabudSX8BtwiICa5kV9DHkdUjsJWHbzHTy4EeLPK1n+Qik0gtJK
0HCf6OqDe9ZA6vEJP53l7Jrda9P/cCQUV8PaQCEdAg6qSomcS0LQUpmYDZLgBjez
WLkc9MhKLwKBgAtzJEiiPk6tS0aA7p8aFB/Fg4M8+POnY4CeIKD09IM/C2rYsmyU
S34ceyaXRtGOqUQ/7iDowpWiqofCIfFTesqE5gFrYAYoTPJfuUBMh/54ePk2gUNB
ucsgmUxrfRsHAZVS7HNluoscg0/WoIAICjRJ39q17SaIMbOMxPJQH5n9AoGAEpFH
MCiedziZqn17m74naWREUvzv9o9U0SHmN8qjHcp+aVvl9yqMefcfBWqXG7XTbr7/
97K0nO5uK7xWvjvs088LPflHtLiHdOQwKM+cZE8Uesi8T4IyvApXfbCLDmpE8+JD
8xZJimj0UACMaunuZcuXKUBxM/LOabfqIf8CEzcCgYB0tsPGmmrdSfMOTdyp3W9Q
1c+70M+G3N6voKvuTGy6jcPS8uk3z0Vy6CFMR1sqv+pkRAbsFDhtZMZbm8SqH5eB
/e+fjppsJ+otn2dGG/Q5Lcuxmu+m17TwhuXkOX+cdV35TxVIxj9v1oOTAOls1r6q
5I2qSKLv8qqbnQ45q34KGQ==
-----END PRIVATE KEY-----`);
            var sig = new KJUR.crypto.Signature({"alg": "SHA512withRSA"});  // Use "SHA1withRSA" for QZ Tray 2.0 and older
            sig.init(pk); 
            sig.updateString(toSign);
            var hex = sig.sign();
            resolve(stob64(hextorstr(hex)));
        } catch (err) {
            console.error(err);
            reject(err);
        }
    };
});