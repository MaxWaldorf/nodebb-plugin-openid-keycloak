<div class="row">
	<div class="col-sm-2 col-xs-12 settings-header">Keycloak SSO</div>
	<div class="col-sm-10 col-xs-12">
		<div class="alert alert-info">
			<p>
				This SSO plugin allows you to enable Single Sign-On with a
				custom Keycloak installation.
			</p>
		</div>
		<form role="form" class="sso-keycloak-settings">
			<div class="form-group">
				<label for="url">Site URL</label>
				<input type="text" name="url" id="url" title="Site URL" class="form-control" placeholder="http://example.com" />
				<p class="help-block">
					There is no need to add a trailing slash to this value (e.g. Use <code>http://example.com</code>, not <code>http://example.com/</code>)
				</p>
			</div>
			<div class="form-group">
				<label for="id">Client ID</label>
				<input type="text" name="id" id="id" title="Client ID" class="form-control" placeholder="Client ID" />
			</div>
			<div class="form-group">
				<label for="secret">Client Secret</label>
				<input type="text" name="secret" id="secret" title="Client Secret" class="form-control" placeholder="Client Secret"/ >
			</div>
			<div class="checkbox">
				<label class="mdl-switch mdl-js-switch mdl-js-ripple-effect">
					<input class="mdl-switch__input" type="checkbox" name="redirectEnabled">
					<span class="mdl-switch__label"><strong>Automatically redirect guests to Keycloak SSO</strong></span>
				</label>
			</div>
		</form>
	</div>
</div>

<button id="save" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
	<i class="material-icons">save</i>
</button>