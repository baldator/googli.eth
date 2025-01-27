import "regenerator-runtime/runtime";

import * as nearAPI from "near-api-js"
import getConfig from "./config"


window.nearConfig = getConfig(process.env.NODE_ENV || "development");
const BOATLOAD_OF_GAS = 100000000000000;

// Initializing contract
async function initContract() {
    // Initializing connection to the NEAR node.
    window.near = await nearAPI.connect(Object.assign({ deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() } }, nearConfig));

    // Initializing Wallet based Account. It can work with NEAR TestNet wallet that
    // is hosted at https://wallet.testnet.near.org
    window.walletAccount = new nearAPI.WalletAccount(window.near);

    // Getting the Account ID. If unauthorized yet, it's just empty string.
    window.accountId = window.walletAccount.getAccountId();

    // Initializing our contract APIs by contract name and configuration.
    window.contract = await window.near.loadContract(nearConfig.contractName, {
        // NOTE: This configuration only needed while NEAR is still in development
        // View methods are read only. They don't modify the state, but usually return some value.
        viewMethods: ['getDocument', 'getDocumentsByUserId', 'isDocumentComplete', 'getDocumentIds'],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: ['addDocument', 'signDocument'],
        // Sender is the account ID to initialize transactions.
        sender: window.accountId,
    });
}

// Using initialized contract
async function doWork() {
    // Based on whether you've authorized, checking which flow we should go.
    if (!window.walletAccount.isSignedIn()) {
        signedOutFlow();
    } else {
        signedInFlow();
    }
}

// Function that initializes the signIn button using WalletAccount
function signedOutFlow() {
    // Displaying the signed out flow container.
    Array.from(document.querySelectorAll('.signed-out')).forEach(el => el.style.display = '');
    // Adding an event to a sing-in button.
    document.getElementById('near-user-status').innerText = "🗷";
    document.getElementById('sign-in').addEventListener('click', () => {
        window.walletAccount.requestSignIn(
            // The contract name that would be authorized to be called by the user's account.
            window.nearConfig.contractName,
            // This is the app name. It can be anything.
            'Google. NEAR notary service',
            // We can also provide URLs to redirect on success and failure.
            // The current URL is used by default.
        );
    });
}

// Main function for the signed-in flow (already authorized by the wallet).
function signedInFlow() {
    // Displaying the signed in flow container.
    Array.from(document.querySelectorAll('.signed-in')).forEach(el => el.style.display = '');

    // Displaying current account name.
    document.getElementById('account-id').innerText = window.accountId;
    document.getElementById('near-user-status').innerText = "✔️";
    var li = document.createElement("li");
    li.setAttribute("userId", window.accountId);
    li.setAttribute("userType", "signer");
    li.appendChild(document.createTextNode(window.accountId + " - Creator"));
    document.getElementById('signer-list').appendChild(li);

    // Adding an event to a sing-out button.
    document.getElementById('sign-out').addEventListener('click', e => {
        e.preventDefault();
        walletAccount.signOut();
        document.getElementById('signer-list').innerHTML = "";
        // Forcing redirect.
        window.location.replace(window.location.origin + window.location.pathname);
    });
}

// Loads nearAPI and this contract into window scope.
window.nearInitPromise = initContract()
    .then(doWork)
    .catch(console.error);

window.checkAccount = function(accountId) {
    console.log(config.nodeUrl)
}

window.createDocument = function() {
    console.log("createDocument");
    
    $("#signMessage").toast("show");
    const documentHash = $("#file-cid").val();
    const documentWitness = $("#signer-list li[usertype='witness']").attr("userid");;
    const documentSigners = $("#signer-list li[usertype!='witness']").map(function() {
        return $(this).attr("userid");
    }).get();
    console.log("document: " + documentHash);
    console.log("witness: " + documentWitness);
    console.log("signers: " + documentSigners);
    window.contract.addDocument({ hash: documentHash, witness: documentWitness, users: documentSigners },
        BOATLOAD_OF_GAS,
        0
    ).then((obj) => { 
        console.log(JSON.stringify(obj)) 
        $("#signMessageOk").toast("show");
    }).catch(err => {
        console.log(JSON.stringify(err));
        $("#signMessageKo").toast("show");
    });
}