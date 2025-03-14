//Importamos los modulos necesarios
import { Router } from "express";
import { default as libraryBackendRoutes } from './index.js'; //Importamos el backend pata la LIBRARY

//Use the import
const router = Router()

/* Configure all the routes of the web page */

//Router for the index
router.get("/", (req, res) => res.render("library/index", { title: "Digital Library" }));

//Router for the list of 3D models
router.get("/library/3dModels", (req, res) => res.render("library/blueprints", { title: "3D Models List" }));

//Router for the BLR list
router.get("/library/blr", (req, res) => res.render("blr.ejs", { title: "BLR List" }));

//Router for the app list
router.get("/appList", (req, res) => res.render("library/appList", { title: "App List" }));

//Router for the Data Analyse Reports list dataAnalyseReports
router.get("/dataAnalyseReports", (req, res) => res.render("library/spotFire", { title: "Data Analyse Reports List" }));

//Router for the PowerApp list
router.get("/powerApps", (req, res) => res.render("library/powerApps", { title: "PowerApps List" }));

//Router for the PowerAutomate list
router.get("/powerAutomate", (req, res) => res.render("library/powerAutomate", { title: "PowerAutomate List" }));

//Router for the best practise list
router.get("/bestPractise", (req, res) => res.render("library/bestPractise", { title: "Best Practise" }));

//Router for the admin panel (log in)
router.get("/adminPanel", (req, res) => res.render("library/adminPanel", { title: "Admin Panel" }));

//Router for the fail login
router.get("/failLogin", (req, res) => res.render("library/failLogin", { title: "Login Failed" }));

//Router to preview the model of the model
router.get("/previewModel", (req, res) => res.render("library/previewModel", { title: 'Preview the model' }));

//Router to view the best practise
router.get("/previewBestPractise", (req, res) => res.render("library/previewBestPractise.ejs", { title: 'View the best practise' }));

//Router for view the training section
router.get('/training', (req, res) => res.render('library/training.ejs', { title: 'View the training' }));

//Router for the chatBot
router.get('/chatBot', (req, res) => res.render('library/chatBot.ejs'));

//Enrutador para el data driven
router.get("/dataDriven", (req, res) => res.render("library/dataDriven/dataDriven", { title: "Data Driven" }));

//Enrutador para el data driven - admin mode
router.get("/dataDriven_admin", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/dataDriven/dataDriven_admin", { title: "Data Driven Admin Mode" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});


//Router for the index - admin mode
router.get("/selectCategories", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/selectCategories", { title: "Digital Library Admin Mode" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the log out - admin mode
router.get("/logout", (req, res) => {
    res.render("library/logout", { title: "Log out" });
});

//Router to list the blueprints - admin mode
router.get("/3dModels_Admin", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/blueprints_Admin", { title: "3D Models Admin Mode" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router to edit the model - admin mode
router.get('/editModel', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/editBlueprint', { title: 'Edit the 3D model' });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the success edit of the 3D model - admin mode
router.get('/successEditModel', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/successEditBlueprint', { title: 'Element update' });
    } else {
        res.render('library/adminPanel', { title: 'Admin Panel' });
    }
});

//Router to previwew the model of the 3d model - admin mode
router.get('/previewModel', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/previewModel', { title: 'Preview the model' });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router to list the best practise - admin mode
router.get('/bestPractise_Admin', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/bestPractise_Admin', { title: "Best practise Admin Mode" })
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router to add a 3D model - admin mode
router.get("/add3dModel", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/addBlueprint", { title: "Add new 3D model" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the succeess add 3D model - admin mode
router.get('/success3dModel', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/successBlueprint', { title: 'New model add' })
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router to add a best practise - admin mode
router.get("/addBestPractise", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/addBestPractise", { title: "Add a new Best practise" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router to edit a best practise - admin mode
router.get("/editBestPractise", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/editBestPractise", { title: "Edit the best practise" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});;

//Router for list the apps - admin mode
router.get("/appList_Admin", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/appList_Admin", { title: "App List Admin Mode" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for add a new app - admin mode
router.get("/addApp", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/addApp", { title: "Add a new App" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the SpotFire list - admin mode
router.get("/dataAnalyseReportsAdmin", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/spotFire_Admin", { title: "Data Analyse Reports List Admin Mode" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router to add a new SpotFire - admin mode
router.get("/addDataReportAdmin", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/addSpotFire", { title: "Add a new data source" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router to add a new Power App - admin mode
router.get("/addPowerAppAdmin", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/addPowerApp", { title: "Add a new PowerApp" })
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" })
    }
});

//Router to edit an App - admin mode
router.get('/editApp', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/editApp', { title: 'Edit the app' })
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" })
    }
});

//Router to edit a SpotFire - admin mode
router.get("/editDataReportAdmin", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/editSpotFire", { title: "Edit the data source" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router to edit a PowerApp - admin mode
router.get("/editPowerApp", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/editPowerApp", { title: "Edit the PowerApp source" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the PowerApp list - admin mode
router.get("/powerApps_Admin", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/powerAppsAdmin", { title: "PowerApps List Admin Mode" })
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" })
    }
})

//Router for the success App - admin mode
router.get('/successApp', (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/successApp", { title: "New App source add" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the success SpotFire - admin mode
router.get("/successDataReport", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/successSpotfire", { title: "New Data Analyse source add" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the success edit Data Analyse - admin mode
router.get("/successEdit", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/successEditSpotfire", { title: "Element update" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the success edit PowerApps - admin mode
router.get("/successEditPowerApps", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/successEditPowerApps", { title: "Element update" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the success edit App - admin mode
router.get("/successEditApp", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/successEditApp", { title: "Element update" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the success PowerApp - admin mode
router.get("/successPowerApps", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/successPowerApps", { title: "New Power Apps source add" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the success Best practise - admin mode
router.get("/successBestPractise", (req, res) => {
    if (req.session.loggedIn) {
        res.render("library/successBestPractise", { title: "New Best practise source add" });
    } else {
        res.render("library/adminPanel", { title: "Admin Panel" });
    }
});

//Router for the view the best practise applied per factory, line...
router.get('/viewAppliedBestPractise', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/viewAppliedBestPractise', { title: 'View the best practise applied' });
    } else {
        res.render('library/adminPanel', { title: 'Admin Panel' });
    }
});

//Router for the PowerAutomate list - admin mode
router.get('/powerAutomate_Admin', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/powerAutomate_Admin', { title: 'PowerAutomate List Admin Mode' })
    } else {
        res.render('library/adminPanel', { title: 'Admin Panel' });
    }
});

//Router for the view to add a PowerAutomate - admin mode
router.get('/addPowerAutomate', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/addPowerAutomate', { title: 'Add a new PowerAutomate' });
    } else {
        res.render('library/adminPanel', { title: 'Admin Panel' });
    }
});

//Router for the success add PowerAutomate - admin mode
router.get('/successPowerAutomate', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/successPowerAutomate', { title: 'New PowerAutomate source add' });
    } else {
        res.render('library/adminPanel', { title: 'Admin Panel' });
    }
});

//Router for the view edit PowerAutomate - admin mode
router.get('/editPowerAutomate', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/editPowerAutomate', { title: 'Edit the PowerAutomate source' });
    } else {
        res.render('library/adminPanel', { title: 'Admin Panel' });
    }
});

//Router for the view success edit PowerAutomate - admin mode
router.get('/successEditPowerAutomate', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/successEditPowerAutomate', { title: 'Element update' });
    } else {
        res.render('library/adminPanel', { title: 'Admin Panel' });
    }
});

//Router for the view training - admin mode
router.get('/training_Admin', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/training_Admin', { title: 'View the training list admin mode' });
    } else {
        res.render('library/adminPanel.ejs', { title: 'Admin Panel' });
    }
});

//Router for the view the control matrix - admin mode
router.get('/viewControlMatrix', (req, res) => {
    if (req.session.loggedIn) {
        res.render('library/bestPractise/viewControlMatrix', { title: 'View the training list admin mode' });
    } else {
        res.render('library/adminPanel.ejs', { title: 'Admin Panel' });
    }
});

//Router for the video station
router.get('/videoStation', (req, res) => res.render('library/videoStation', { title: "Video Station" }));

//Router for the view of the film
router.get("/film", (req, res) => res.render("library/film"));

//Router para los end points
router.use('/api', libraryBackendRoutes);

//Export the router
export default router