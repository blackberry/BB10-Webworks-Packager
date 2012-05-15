#BB10-WebWorks-Packager

##Prerequisites
1. Install node and npm and add to path. [Download Here](http://nodejs.org/#download)
2. Install BlackBerry Native SDK. [Download Here](https://bdsc.webapps.blackberry.com/native/)
3. Install BlackBerry 10 WebWorks SDK. [Download Here](https://bdsc.webapps.blackberry.com/html5/download/sdk)
3. Install CMake. [Download Here](http://www.cmake.org/cmake/resources/software.html)
4. Add BlackBerry Native SDK bin directory to path. i.e. *Installation Directory*\host\win32\x86\usr\bin
5. Add CMake bin to path. i.e. *Installation Directory*\bin
6. Add Git bin to path. i.e. *Installation Directory*\bin [Windows only]

##Setup and Build
1. `git clone https://github.com/blackberry-webworks/BB10-Webworks-Packager.git`
2. `cd BB10-WebWorks-Packager`
3. `git checkout next`
4. Copy the `dependencies` directory from the BlackBerry 10 WebWorks SDK installation directory into `BB10-WebWorks-Packager`
5. On windows run `*BBNDK Installation Directory*\bbndk-env.bat`. This needs to be run each time before you configure.
   On Mac, you can simply add `source *installation directory here*/bbndk-env.sh` to your bash profile
6. Run `./configure` on Mac (`sudo ./configure` if you get permission errors) or `sh configure` on Windows
7. Run `jake test` and check that jake runs and completes

##Building an application
On Mac:
`./bbwp test/test.zip -o <output dir>`

On Windows:
`bbwp.bat test\test.zip -o <output dir>`