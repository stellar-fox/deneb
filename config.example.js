exports.attributes = {
    connectionStr: "postgres://user:password@host:port/database",
    apiKey: "<node api key>",
    firebase: {
        apiKey: "<firebase_api_key>",
        authDomain: "<firebase_auth_domain>",
        databaseURL: "<firebase_db_url>",
        projectId: "<firebase_project_id>",
        storageBucket: "<firebase_project_storage_bucket>",
        messagingSenderId: "<project_sender_id>",
    },
    admin: {
        "type": "service_account",
        "project_id": "<firebase_project_id>",
        "private_key_id": "<firebase_private_key_id>",
        "private_key": "<firebase_privaete_key>",
        "client_email": "<firebase_client_email>",
        "client_id": "<firebase_client_id>",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://accounts.google.com/o/oauth2/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "<client_x509_cert_url>",
    },
    firebaseDB: "<firebase_db>",
    mailchimp: {
        api: "https://<your_data_center>.api.mailchimp.com/3.0/",
        lists: {
            "listName1": "<list_id>",
            "listNameN": "<list_id>",
        },
        username: "<mailchimp_username>",
        apiKey: "<mailchimp_api_key>",
    },
    stripe: {
        apiKey: "<stipe_api_key>",
    },
    stellar: {
        issuingPublic: "<issuing account public key>",
        distributionSecret: "<distribution account secret key>",
        horizon: "<horizon url>",
        assetCode: "<asset code>",
        distMemo: "<distribution memo>",
    },
}
