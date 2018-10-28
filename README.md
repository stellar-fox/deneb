<p align="center">
    <br />
    <a title="Learn more about Stellar Fox" href="https://stellarfox.net/" target="_blank">
        <img src="https://raw.githubusercontent.com/stellar-fox/cygnus/master/public/favicon.ico" alt="Stellar Fox Logo" />
        <br />
        <b>stellarfox.net</b>
    </a>
</p>

> Next generation, personal micro finance solution, which offers nearly instant and extremely low fee remittance service.

<br />




# Stellar Fox (backend)

Moving Value at the Speed of Light

<br />




## Introductory videos

* [Opening Your Own Bank](https://youtu.be/ScPSsJDN4fk)<br />
[
    ![Opening Your Own Bank](https://i.ytimg.com/vi/ScPSsJDN4fk/mqdefault.jpg)
](https://youtu.be/ScPSsJDN4fk "Opening Your Own Bank")
<br />

* [Convenient Account Pairing](https://youtu.be/oB9H0QKAtRI)<br />
[
    ![Convenient Account Pairing](https://i.ytimg.com/vi/oB9H0QKAtRI/mqdefault.jpg)
](https://youtu.be/oB9H0QKAtRI "Convenient Account Pairing")
<br />

* [Transferring Money at the Speed of Light](https://youtu.be/K7x7HIlsAPU)<br />
[
    ![Transferring Money at the Speed of Light](https://i.ytimg.com/vi/K7x7HIlsAPU/mqdefault.jpg)
](https://youtu.be/K7x7HIlsAPU "Transferring Money at the Speed of Light")

<br />




## build/run instructions

* first, checkout the project

    ```bash
    $ git clone git@github.com:stellar-fox/deneb.git
    Cloning into 'deneb'...
    $ cd deneb
    ```

* install dependencies

    ```bash
    $ npm i
    ```

* prepare [configuration file][config]

    ```bash
    $ cp src/config/configuration.example.json src/config/configuration.json
    $ vi src/config/configuration.json
    ```

* then, configure the database

    ```
    $ sudo -i
    # su - postgres
    $ dropdb stellarfox
    $ createdb stellarfox --owner some_user
    $ ^D
    # ^D
    $ psql stellarfox -U some_user -W -h 127.0.0.1 -f db/schema.sql
    ```

* run in development mode

    ```bash
    $ npm start
    ```

    > ```
    > Compiling for 'development' ...
    > [📠] deneb::4001 (v.0.2.0)
    > ```

* or build and run

    ```bash
    $ npm run build
    ```

    > ```
    > Compiling for 'production' ...
    > Hash: 373148fb7dbae3d35840
    > Version: webpack 4.23.1
    > Time: 3094ms
    > Built at: 2018-10-29 00:20:41
    > Asset      Size  Chunks             Chunk Names
    > deneb.js  46.6 KiB       0  [emitted]  deneb
    > Entrypoint deneb = deneb.js
    > [0] ./src/config/configuration.json 3.54 KiB {0} [built]
    > [1] external "@xcmats/js-toolbox" 42 bytes {0} [built]
    > ...
    >     + 3 hidden modules
    > ```

    ```bash
    $ npm run production
    ```

    > ```
    > [📠] deneb::4001 (v.0.2.0)
    > ```

<br />




## Support

```
GAUWLOIHFR2E52DYNEYDO6ZADIDVWZKK3U77V7PMFBNOIOBNREQBHBRR
```




[config]: src/config/configuration.example.json
