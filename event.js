let form = { };
let divs = { };
let toggles = { };

let customFields = { },
	totalCustomFields = { },
	customFieldsTypes = { };

let request_type, module_name, host_name, steam_draft, module_level, gift_nicknames, gift_value, gift_type;
let last_form_type;

function buildForm()
{
	if (last_form_type)
		form[last_form_type].hidden = true
	form[last_form_type = request_type.value].hidden = false;
}

function toggleDisplay(divName)
{
	let div = divs[divName];
	div.hidden = !div.hidden;
}

function checkPattern(element, regexp)
{
	regexp = new RegExp(regexp, 'g');
	element.value = element.value.replace(regexp, '');
}

function loadCustomFieldTypes(element)
{
	let types = element.attributes.types.value;
	if (!types) return;
	types = types.split(',')

	for (let t in types)
		types[t] = `<option value="${types[t]}">${types[t]}</option>`;

	customFieldsTypes[element.id] = types.join('\n');
}

function addCustomField(divName, ...description)
{
	if (totalCustomFields[divName] == undefined)
		totalCustomFields[divName] = 1;
	else
		totalCustomFields[divName]++;

	let div = customFields[divName];
	let numberId = totalCustomFields[divName];

	let newElement = document.createElement("div");
	div.appendChild(newElement);

	let descriptions = [ ];
	for (let desc of description)
		descriptions.push(`<textarea name="custom_${divName}_value_${numberId}" oninput="generate()" placeholder="${desc} ${numberId}" style="border-radius: 0px;"></textarea>`);
	descriptions = descriptions.join('\n');

	newElement.outerHTML =
		`<div id="custom_${divName}_${totalCustomFields[divName]}" style="display: flex">
			<div class="square" style="background-color: #7289DA;"></div>
			${descriptions}
			<select id="custom_${divName}_type_${numberId}" oninput="generate()">
				${customFieldsTypes[`custom_${divName}`]}
			</select>
		</div>`;
}

function delCustomField(divName)
{
	if (!totalCustomFields[divName]) return;

	document.getElementById(`custom_${divName}_${totalCustomFields[divName]--}`).remove();
	generate();
}

function capitalizedStr(e)
{
	e = e.toLowerCase();
	return e.charAt(0).toUpperCase() + e.slice(1);
}

function checkNicknameTag(e)
{
	if (e.indexOf('#') == -1)
		e += "#0000";
	return e;
}

function getCustomFieldInput(divName)
{
	let customFieldList = [ ];
	let tmpList, values, type;
	for (let numberId = 1; numberId <= totalCustomFields[divName]; numberId++)
	{
		tmpList = [ ];
		values = document.getElementsByName(`custom_${divName}_value_${numberId}`);
		for (let v of values)
			tmpList.push(v.value.trim());
		type = document.getElementById(`custom_${divName}_type_${numberId}`).value;
		tmpList.push(type);

		customFieldList.push(tmpList);
	}
	return customFieldList;
}

function transformArrayIntoReadableValueAndType(arr)
{
	for (let v in arr)
		arr[v] = `${arr[v][0]} [${arr[v][1]}]`;
	return arr.join(" + ");
}

function generate()
{
	copyButton.innerHTML = "Copy to clipboard";

	let raw_module_name = `evt_${module_name.value.replace(/^#?evt_/, '')}`;
	let raw_host_name = capitalizedStr(checkNicknameTag(host_name.value));

	let f_module_name = `**#${raw_module_name}**`;
	let f_host_name = `**${raw_host_name}**`

	switch (request_type.value)
	{
		case "create":
			result.value = `<@232581573998804994>[Tig], please create this module for the next Lua event!
Module name: ${f_module_name}
Attach to the account: ${f_host_name}
Status: **Disabled** (**3**)

Step by step:
\`\`\`
/room* mo-@#${raw_module_name}

/nouveaumodule ${raw_host_name} ${raw_module_name}

Copy paste the line below in your /lua window and submit:
print(1)

/launchmodule ${raw_module_name}

/moduleofficiel ${raw_module_name} 3
\`\`\`
`;
			break;
		case "list":
			let titles, badges, npc_items;
			if (toggles.titles.checked)
			{
				titles = getCustomFieldInput("titles");
				for (let v in titles)
				{
					if (titles[v][1] == "New")
						titles[v][0] = `«${titles[v][0]}»`;
					titles[v] = `${titles[v][0]} [${titles[v][1]}]`;
				}
				titles = titles.join(" + ");
			}
			if (toggles.badges.checked)
			{
				badges = getCustomFieldInput("badges");
				for (let v in badges)
				{
					badges[v][1] = (
						badges[v][2] == "New" ? ` | Profile description: ${badges[v][1]}`
						:
						''
					);
					badges[v] = `${badges[v][0]} [${badges[v][2]}]${badges[v][1]}`;
				}
				badges = badges.join('\n+ ');
			}
			if (toggles.npc_items.checked)
			{
				npc_items = getCustomFieldInput("npc_items");
				for (let v in npc_items)
					npc_items[v] = `Get ${npc_items[v][2]} items of ID '${npc_items[v][0]}' | Pay ${npc_items[v][1]} ${npc_items[v][3]}`;
				npc_items = `\`\`\`\n${npc_items.join('\n')}\n\`\`\``;
			}

			result.value = `<@232581573998804994>[Tig], the Lua event ${f_module_name} needs the following rewards:
${toggles.titles.checked ? `**Titles** (put them in the Lua folder of translations): ${titles}` : ''}
${toggles.orbs.checked ? `**Shaman Orbs**: ${transformArrayIntoReadableValueAndType(getCustomFieldInput("orbs"))}` : ''}
${toggles.badges.checked ? `**Badges**: ${badges}` : ''}

${toggles.pets.checked || toggles.skins.checked || toggles.chest.checked ? "__Inventory__:\n" : ''}
${toggles.pets.checked ? `**Pets**: ${transformArrayIntoReadableValueAndType(getCustomFieldInput("pets"))}` : ''}
${toggles.skins.checked ? `**Skins**: ${transformArrayIntoReadableValueAndType(getCustomFieldInput("skins"))}` : ''}
${toggles.chest.checked ? `**Golden ticket**: (\`golden_ticket_50\`) A code that gives 50 golden tickets` : ''}

Can you share the codes for these rewards once implemented, please?

${toggles.consumables.checked ? "The event is going to use consumables too, can you enable them?\n" : ''}
${toggles.banner.checked ? `Will this event get a banner to be used with _system.setLuaEventBanner_? If so, I need the ID.` : ''}

${toggles.npc_items.checked ?  `__Event shop__:
${npc_items}` : ''}`;
			break;
		case "start":
			result.value = `<@232581573998804994>[Tig], please start the Lua event!
Module name: ${f_module_name}
Status: **Event** (**2**)
Steam announcement draft: \`\`\`
${steam_draft.value}
\`\`\``;
			break;
		case "end":
			result.value = `<@232581573998804994>[Tig], please disable the Lua event!
Module name: ${f_module_name}
Status: ${module_level.value}`;
			break;
		case "credit":
			let header = (
				gift_type.value == "item" ? "[/dressing item id] [player name] [role]"
				:
				gift_type.value == "fraise" ? "[total fraises] [player name] [role]"
				:
				'?'
			);

			let credit = getCustomFieldInput("gift_nicknames");
			for (let c in credit)
				credit[c] = `${gift_value.value} ${capitalizedStr(checkNicknameTag(credit[c][0]))} ${credit[c][1]}`;
			credit = credit.join('\n');

			result.value = `<@285878295759814656>[Bolo] or <@164416116683309056>[Santa], I would like to offer the following for the members from the project ${f_module_name}!
\`\`\`
${header}

${credit}
\`\`\``;
			break;
	}

	let resultLen = (2000 - result.value.length);
	size.innerHTML = (resultLen < 0 ? "<font color=\"#FC4646\">" : '') + resultLen + " characters left.";
}

function copy()
{
	let result = document.getElementById("result");
	if (result.value == "") return;

	result.select();
	document.execCommand("copy");
	document.getElementById("copy").innerHTML = "Copied";
}

window.onload = function()
{
	result = document.getElementById("result");
	copyButton = document.getElementById("copy");
	size = document.getElementById("size");

	form.create = document.getElementById("form_create");
	form.list = document.getElementById("form_list");
	form.start = document.getElementById("form_start");
	form.end = document.getElementById("form_end");
	form.credit = document.getElementById("form_credit");

	request_type = document.getElementById("request_type");
	module_name = document.getElementById("module_name");
	host_name = document.getElementById("host_name");
	steam_draft = document.getElementById("steam_draft");
	module_level = document.getElementById("module_level");
	gift_nicknames = document.getElementById("gift_nicknames");
	gift_value = document.getElementById("gift_value");
	gift_type = document.getElementById("gift_type");

	divs.titles = document.getElementById("div_titles");
	divs.badges = document.getElementById("div_badges");
	divs.orbs = document.getElementById("div_orbs");
	divs.pets = document.getElementById("div_pets");
	divs.skins = document.getElementById("div_skins");
	divs.npc_items = document.getElementById("div_npc_items");

	toggles.titles = document.getElementById("has_titles");
	toggles.badges = document.getElementById("has_badges");
	toggles.orbs = document.getElementById("has_orbs");
	toggles.pets = document.getElementById("has_pets");
	toggles.skins = document.getElementById("has_skins");
	toggles.chest = document.getElementById("has_chest");
	toggles.consumables = document.getElementById("has_consumables");
	toggles.banner = document.getElementById("has_banner");
	toggles.npc_items = document.getElementById("has_npc_items");

	customFields.gift_nicknames = document.getElementById("custom_gift_nicknames");
	customFields.titles = document.getElementById("custom_titles");
	customFields.badges = document.getElementById("custom_badges");
	customFields.orbs = document.getElementById("custom_orbs");
	customFields.pets = document.getElementById("custom_pets");
	customFields.skins = document.getElementById("custom_skins");
	customFields.npc_items = document.getElementById("custom_npc_items");

	for (let o in customFields)
		loadCustomFieldTypes(customFields[o]);

	last_form_type = request_type.value;
	buildForm();
}
