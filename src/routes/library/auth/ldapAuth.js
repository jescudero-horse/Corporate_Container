//Import ldapjs
import ldap from 'ldapjs';

/**
 * Function to authenticate in the LDAP server using the IPN and password
 * @param {string} ipn Represent the user IPN to log in
 * @param {string} password Represent the password of the user to log in
 * @param {*} callback Callback function to handle the authentication result
 */
function ldapAuth(ipn, password, callback) {
    //Define the LDAP server client
    var client = ldap.createClient({
        url: 'ldap://annope01.mc2.renault.fr:389'
    });

    //Define the options to search
    var opts = {
        filter: `(uid=${ipn})`,
        scope: 'sub',
        attributes: ['dn', 'mail']
    };

    //Connect with the LDAP server
    client.bind('uid=awtvash,ou=xxx,ou=people,o=renault', 'r4008358', (err) => {
        if (err) {
            console.error("> Error a la hora de establecer la conexión");
        } else {
            console.log("> Conexión establecida");

            //Start the search
            client.search('o=renault', opts, (err, res) => {
                console.log("> Iniciando búsqueda...");

                if (err) {
                    console.error("> Ha ocurrido un error a la hora de obtener la información: ", err);
                    callback(err, null, false);
                } else {
                    console.log("> Datos encontrados:\n");
                    let userMail = null;

                    res.on('searchEntry', (entry) => {
                        console.log("> Mostrando la información...");
                        console.log('entry: ' + JSON.stringify(entry.pojo));

                        const dn = entry.objectName.toString();
                        console.log("> DN del usuario: ", dn);

                        userMail = entry.attributes.find(attr => attr.type === 'mail')?.values[0] || null;

                        //Create another connection to authenticate the user using her DN and their password (from the input)
                        client.bind(dn, password, (err) => {
                            if (err) {
                                console.error("> Autenticación fallida: ", err);
                                callback(err, null, false);
                            } else {
                                console.log("> Autenticación exitosa");
                                client.unbind();
                                callback(null, userMail, true);
                            }
                        });
                    });

                    res.on('searchReference', (referral) => {
                        console.log('referral: ' + referral.uris.join());
                    });
                    res.on('error', (err) => {
                        console.error('error: ' + err.message);
                        callback(err, null, false);
                    });
                    res.on('end', (result) => {
                        console.log('status: ' + result.status);
                    });
                }
            });
        }
    });
}

//Export the default module
export default ldapAuth;