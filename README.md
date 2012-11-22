#BlackBerry 10 WebWorks Packager
WebWorks is an application framework and packaging tool that allows a developer to create a standalone BlackBerry application using HTML5/CSS/JavaScript.  Web developers can create a device application experience, including AppWorld distribution and monetization to system security policy enforcement, to deep device system and service integration. All using the technologies they are familiar with, leveraging the power of the industry leading web platform being built for BlackBerry 10.
This repo contains the code for the BlackBerry 10 WebWorks Packager and submodules the Framework.

##Prerequisites
1. Install [node[v0.6.10] and npm](http://nodejs.org/dist/v0.6.10/) and add to path.
2. Install [BlackBerry Native SDK](https://bdsc.webapps.blackberry.com/native/).
3. Install [BlackBerry 10 WebWorks SDK](https://developer.blackberry.com/html5/download/sdk).
4. [*Windows*] Add Git bin to PATH. i.e. `*Installation Directory*\bin`

##Setup and Build
1. `git clone https://github.com/blackberry-webworks/BB10-Webworks-Packager.git`
2. `cd BB10-WebWorks-Packager`
3. `git checkout master`
4. **Setup bbndk environment variables:** (must be done within each session, prior to jake)
    - [*Mac/Linux*] `source *BBNDK installation directory*/bbndk-env.sh`
    - [*Windows*] `*BBNDK installation directory*\bbndk-env.bat`
5. **Copy Dependencies:** <br />
    Copy the `dependencies` directory from the latest [BlackBerry 10 WebWorks SDK](https://developer.blackberry.com/html5/download/sdk) into the cloned `BB10-WebWorks-Packager` folder. For more details on how to install go [here](https://developer.blackberry.com/html5/documentation/install_and_configure_ww_bb10_2007535_11.html).
6. **Configuration:**
    - [*Mac/Linux*] `./configure` [from terminal]
    - [*Windows*] `bash configure` [from command prompt]
7. Run `jake` or `jake build` and check that the output folder is created under the "target/zip" subfolder.
8. Run `jake test` and check that jake runs and completes

##Building an application
[Mac/Linux] `./bbwp test/test.zip -o <output dir>`<br />
[Windows] `bbwp.bat test\test.zip -o <output dir>`<br />

Please ensure you build your application from the "target/zip" folder and not the root of your `BB10-Webworks-Packager` clone;
Otherwise the resulting bar won't launch.

##Common issues
 ```
Cloning into dependencies/webplatform... error: Couldn't resolve host 'github.rim.net' while accessing
http://github.rim.net/webworks/webplatform.git/info/refs
```
<br />
Solution: This error can be ignored, but please see the "Setup and Build" - "Webplatform setup:" section above for instructions on copying the necessary webplatform files.

## Authors
* [Bryan Higgins](http://github.com/bryanhiggins)
* [Chris Del Col](http://github.com/cdelcol)
* [Daniel Audino](http://github.com/danielaudino)
* [Danyi Lin](http://github.com/dylin)
* [Derek Watson](http://github.com/derek-watson)
* [Eric Li](http://github.com/ericleili)
* [Eric Pearson](http://github.com/pagey)
* [Erik Johnson](http://github.com/erikj54)
* [Gord Tanner](http://github.com/gtanner)
* [Hasan Ahmad](http://github.com/haahmad)
* [Hoyoung Jang](http://github.com/hoyoungjang)
* [Igor Shneur](http://github.com/ishneur)
* [James Keshavarzi](http://github.com/jkeshavarzi)
* [Jeffrey Heifetz](http://github.com/jeffheifetz)
* [Nukul Bhasin](http://github.com/nukulb)
* [Rosa Tse](http://github.com/rwmtse)
* [Rowell Cruz](http://github.com/rcruz)
* [Sergey Golod](http://github.com/tohman)
* [Stephan Leroux](http://github.com/sleroux)

## Contributing
**To contribute code to this repository you must be [signed up as an official contributor](http://blackberry.github.com/howToContribute.html).**

To add new Samples or make modifications to existing Samples:

1. Fork the **BB10-Webworks-Packager** repository
2. Make the changes/additions to your fork
3. Send a pull request from your fork back to the **BB10-Webworks-Packager** repository
4. If you made changes to code which you own, send a message via github messages to one of the Committers listed below to have your code merged

## Committers
* [Nukul Bhasin](http://github.com/nukulb)
* [Jeffrey Heifetz](http://github.com/jeffheifetz)
* [Chris Del Col](http://github.com/cdelcol)

## Other related Repos
 * [BlackBerry 10 WebWorks Framework](https://github.com/blackberry/BB10-WebWorks-Framework)
 * [BlackBerry 10 WebWorks Samples](https://github.com/blackberry/BB10-WebWorks-Samples)
 * [BlackBerry 10 WebWorks Community APIs](https://github.com/blackberry/WebWorks-Community-APIs/tree/master/BB10)
