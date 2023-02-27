'use strict';

function renderAdminPage(req, res) {
	res.render('admin/plugins/oidc', {});
}


module.exports = {
	renderAdminPage,
};
