/*********************************************************************

 TinyMCE6 prismプラグイン / prism plugin for TinyMCE6

 ライセンス / License：LGPL
 ver.1.0.0 (2022/08/05)
 Homepage : https://holydragoon.jp/
 Copyright(C) 2022 MINAKATA Kaori.

*********************************************************************/

(function () {
	'use strict';

	tinymce.PluginManager.requireLangPack('prism');
	tinymce.PluginManager.add('prism', function (editor) {
		//ダイアログの中身を設定 / Set the contents of the dialog
		function _getDialogConfig() {
			var dom = editor.dom, selection = editor.selection, data = {}, Elmt, ln, fl, hl;
			var defaultLanguage = 'markup', selectedCode, brTag = '';

			//言語設定の初期化 / Initialize language settings
			editor.options.register('prism_languages', {
				processor: 'object[]',
				default: [
					{ text: 'HTML/XML', value: 'markup' },
					{ text: 'CSS', value: 'css' },
					{ text: 'C-like', value: 'clike' },
					{ text: 'JavaScript', value: 'javascript' }
				]
			});

			//言語設定 / Language settings
			//tinymce.initでprism_languages: [{text: '○○', value: '○○'},～];で指定した言語設定が代入されます / The language setting specified by prism_languages: [{text: 'xx', value: 'xx'}, ~]; will be assigned in tinymce.init.
			var languageItems = editor.options.get('prism_languages');
			selectedCode = selection.getContent({ format: 'text' });

			data.code = selectedCode;
			if (data.code == '') {
				brTag = '<br>';
			}
			if (data.code == '&nbsp;') {
				data.code = '';
			}

			return {
				title: 'Prism - Code Editor',
				minWidth: 450,
				body: {
					type: 'panel',
					items: [
						{
							type: 'selectbox',
							name: 'language',
							label: "Select language",
							items: languageItems,
							flex: true
						},
						{
							type: 'textarea',
							name: 'code',
							minHeight: 200,
							multiline: true,
							placeholder: "Please insert your code."
						},
						{
							type: 'checkbox',
							name: 'linenumber',
							label: 'Line Number',
						},
						{
							type: 'grid',
							columns: 2,
							items: [
								{
									type: 'input',
									name: 'firstline',
									label: 'First Line',
									disabled: false
								},
								{
									type: 'input',
									name: 'highlight',
									label: 'Highlight',
									disabled: false
								},
							]
						},
					]
				},
				initialData: {
					code: data.code,
					linenumber: true
				},
				onChange: (dialogApi) => {
					const data = dialogApi.getData();
					dialogApi.setEnabled('firstline', data.linenumber);
					dialogApi.setEnabled('highlight', data.linenumber);
				},
				onSubmit: (api) => {
					if (api.getData().code === '') {
						tinyMCE.activeEditor.windowManager.alert("Please insert your code.");

						return;
					} else {
						var code = api.getData().code;
						code = code.replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/　{4}/g, "\t");
						var language = api.getData().language ? api.getData().language : defaultLanguage;
						var firstline = api.getData().firstline ? api.getData().firstline : '';
						var linenumber = api.getData().linenumber ? api.getData().linenumber : false;
						var highlight = api.getData().highlight ? api.getData().highlight : '';

						//<code>の中身を設定 / Set contents of <code>
						Elmt = dom.create('code', {
							'class': 'language-' + language,
						}, code);

						//行数を表示するときの設定 / Settings for displaying the number of lines
						if (linenumber) {
							ln = ' class="line-numbers"';
						}

						//開始行の設定 / Setting the start line
						if (firstline != '') {
							fl = ' data-start="' + firstline + '"';
						}

						//強調する行の設定 / Set line to highlight
						if (highlight != '') {
							hl = ' data-line="' + highlight + '"';
						}

						if (ln === undefined) {
							tinymce.activeEditor.execCommand('mceInsertContent', false, `<pre>` + dom.getOuterHTML(Elmt) + `</pre>` + brTag);
						} else {
							tinymce.activeEditor.execCommand('mceInsertContent', false, `<pre` + ln + fl + hl + `>` + dom.getOuterHTML(Elmt) + `</pre>` + brTag);
						}
						api.close();
					}
				},
				buttons: [
					{
						text: 'Close',
						type: 'cancel',
						onclick: 'close'
					},
					{
						text: 'Insert',
						type: 'submit',
						primary: true,
					}
				]
			}
		}

		function _onAction() {
			var selection = editor.selection, selectionNode = selection.getNode();

			if (selectionNode.nodeName.toLowerCase() === 'code') {
				var text = $(selectionNode).unwrap().text();
				text = text.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/\n{2}/g, '<p>').replace(/\n/g, '<br>').replace(/ /g, "&nbsp;").replace(/\t/g, "　　　　");
				selection.setContent(text);
				selectionNode.remove();
			} else {
				//ダイアログを表示 / Show dialog
				editor.windowManager.open(_getDialogConfig());
			}
		}

		editor.ui.registry.addToggleButton('prism', {
			icon: 'code-sample',
			tooltip: 'Insert code with Prism',
			onAction: _onAction,
			onSetup: (buttonApi) => {
				var editorEventCallback = (eventApi) => {
					buttonApi.setActive(eventApi.element.nodeName.toLowerCase() === 'code');
				};
				editor.on('NodeChange', editorEventCallback);
				return () => {
					editor.off('NodeChange', editorEventCallback);
				}
			}
		});

		editor.ui.registry.addMenuItem('prism', {
			text: 'Prism',
			icon: 'code-sample',
			onAction: _onAction
		});

		//helpプラグインに表示するデータを設定 / Set data to be displayed in help plugin
		return {
			getMetadata: () => ({
				name: "Prism",
				url: "https://github.com/holydragoonjp/Prism-for-TinyMCE6"
			})
		};
	});
})();