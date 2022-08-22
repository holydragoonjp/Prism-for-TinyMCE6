/*********************************************************************

 TinyMCE6 prismプラグイン / prism plugin for TinyMCE6

 ライセンス / License：LGPL
 ver.1.1.0 (2022/08/22)
 Homepage : https://holydragoon.jp/
 Copyright(C) 2022 MINAKATA Kaori.

*********************************************************************/

(function () {
	'use strict';

	const global = tinymce.util.Tools.resolve('tinymce.PluginManager');

	//ダイアログの中身を設定 / Set the contents of the dialog
	const getDialogConfig = editor => {
		const dom = editor.dom, selection = editor.selection, defaultLanguage = 'markup';
		let data = {}, brTag = '', Elmt, ln = '', fl, hl;

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
		const languageItems = editor.options.get('prism_languages');
		const selectedCode  = selection.getContent({ format: 'text' });

		data.code = selectedCode;
		if (data.code == '') {
			brTag = '<br>';
		}
		if (data.code == '&nbsp;') {
			data.code = '';
		}

		editor.windowManager.open({
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
			onChange: dialogApi => {
				const data = dialogApi.getData();
				dialogApi.setEnabled('firstline', data.linenumber);
				dialogApi.setEnabled('highlight', data.linenumber);
			},
			onSubmit: api => {
				if (api.getData().code === '') {
					editor.windowManager.alert("Please insert your code.");

					return;
				} else {
					let prism_code = api.getData().code;
						prism_code = prism_code.replace(/\</g, "&lt;").replace(/\>/g, "&gt;").replace(/　{4}/g, "\t");

					const language   = api.getData().language ? api.getData().language : defaultLanguage;
					const firstline  = api.getData().firstline ? api.getData().firstline : '';
					const linenumber = api.getData().linenumber ? api.getData().linenumber : false;
					const highlight  = api.getData().highlight ? api.getData().highlight : '';

					//<code>の中身を設定 / Set contents of <code>
					Elmt = dom.create('code', {
						'class': 'language-' + language,
					}, prism_code);

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

					if (ln == '') {
						editor.execCommand('mceInsertContent', false, `<pre>` + dom.getOuterHTML(Elmt) + `</pre>` + brTag);
					} else {
						editor.execCommand('mceInsertContent', false, `<pre` + ln + fl + hl + `>` + dom.getOuterHTML(Elmt) + `</pre>` + brTag);
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
		});
	}

	//ボタンを設定 / Set button
	const register$1 = editor => {
		editor.ui.registry.addToggleButton('prism', {
			icon: 'code-sample',
			tooltip: 'Insert code with Prism',
			onAction: () => {
				const selection = editor.selection, selectionNode = selection.getNode();
				if (selectionNode.nodeName.toLowerCase() === 'code') {
					let text = $(selectionNode).unwrap().text();
						text = text.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(/\n{2}/g, '<p>').replace(/\n/g, '<br>').replace(/ /g, "&nbsp;").replace(/\t/g, "　　　　");
					selection.setContent(text);
					selectionNode.remove();
				} else {
					//ダイアログを表示 / Show dialog
					getDialogConfig(editor);
				}
			},
			onSetup: buttonApi => {
				const editorEventCallback = eventApi => {
					buttonApi.setActive(eventApi.element.nodeName.toLowerCase() === 'code');
				};
				editor.on('NodeChange', editorEventCallback);
				return () => {
					editor.off('NodeChange', editorEventCallback);
				}
			}
		});
	}

	//プラグイン実行 / Run plugin
	const Plugin = () => {
		global.requireLangPack('prism');
		global.add('prism', editor => {
			register$1(editor);

			//helpプラグインに表示するデータを設定 / Set data to be displayed in help plugin
			return {
				getMetadata: () => ({
					name: "Prism",
					url: "https://github.com/holydragoonjp/Prism-for-TinyMCE6"
				})
			};
		});
	};

	Plugin();
})();