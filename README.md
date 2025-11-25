# Sistema de Control Bibliotecario en Linea - ITI (Online Library Control System - ITI)

This is a website made in HTML, CSS, PHP and JavaScript, the framework used to run this website is XAMPP 8.2.12 which includes "Apache 2.4.58, MariaDB 10.4.32, PHP 8.2.12, phpMyAdmin 5.2.1, OpenSSL 3.1.3, XAMPP Control Panel 3.2.4, Webalizer 2.23-04, Mercury Mail Transport System 4.63, FileZilla FTP Server 0.9.41, Tomcat 8.5.96 (with mod_proxy_ajp as connector), Strawberry Perl 5.32.1.1 Portable"

Despite the name implying to be online, the website was not built to be released online to the users due to change of plans internally, most stuff was being planned to be built for multiple users connecting to it with a logging system for users and admins, ultimatelly was discontinued and some stuff got also removed and changed to fit the needs at the time

It uses the following libraries which are already included in the project files since it was meant to work without the need for internet conection:
- QZ Tray for printing to a receipt printer through the navigator
- Selectize for adding comboboxes with multiple choices to HTML
- PHPSpreadsheet for creating Excel Spread Sheets for reports

# Steps to run this project:

1. Download and configure XAMPP 8.2.12: https://www.apachefriends.org/download.html
2. Download this project's files into a folder and move them all into the htdocs folder of XAMPP's files
3. Run XAMPP Control Panel as Administrator and enter phpMyAdmin website locally
4. Import the database using the "centro_de_informacion.sql" file (it already contains one user to login into the website)
5. Access this project's website folder from localhost to run the index.html
6. Use the username "admin" and password "1234" to enter

As an optional thing you can do, this project used a receipt printer that in order to use you have to download and install the Qz Tray program from their website, configure it properly so it functions well with the website and have it running on your computer while the website is running, for further information on that check their website and documentation for it: https://qz.io
