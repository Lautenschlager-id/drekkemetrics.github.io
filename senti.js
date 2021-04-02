const cors_url = "https://bolo-cors.herokuapp.com/";
const forum_url = cors_url + "https://atelier801.com/staff-ajax?role=4";

let valueField = { }

let date = new Date();
let currentYear = date.getFullYear(), currentMonth = date.getMonth()+1;

let size, copyButton, monthYear, displayMembers, allTime, warn, report, message, debugData, result;

function newField(divName, description, value)
{
	if (valueField[divName] == undefined)
		valueField[divName] = 0;
	else
		valueField[divName]++;

	let div = document.getElementById(divName);
	let textarea = `oninput="generate()" placeholder="${description} ${valueField[divName]+1}" style="border-radius: 0px;"`;

	let newElement = document.createElement("div");
	div.appendChild(newElement);

	if (divName == "nicknames")
		newElement.outerHTML = `<textarea style="width: auto; display: inline" id="${divName}_${valueField[divName]}" ${textarea} ${!valueField[divName]?"required":''}>${value??''}</textarea>`;
	else if (divName == "patterns")
		newElement.outerHTML =
			`<div id="patterns_${valueField[divName]}" style="display: flex">
				<div class="square" style="background-color: #7289DA;"></div>
				<textarea id="pattern_value_${valueField[divName]}" ${textarea}></textarea>
				<select id="pattern_type_${valueField[divName]}" oninput="generate()">
					<option value="">any</option>
					<option value="avatar">avatar</option>
					<option value="muteforum">muteforum</option>
					<option value="mutemessage">mutemessage</option>
					<option value="profile">profile</option>
					<option value="report">report</option>
					<option value="warn">warn</option>
					<option value="handledreport">handledreport</option>
				</select>
			</div>`;
}

function delField(divName)
{
	console.log(divName, valueField[divName]);
	if (!valueField[divName]) return;

	document.getElementById(`${divName}_${valueField[divName]--}`).remove();
	generate();
}

function populateMonthAndYear()
{
	let div = document.getElementById("month_year");

	let tmpCurrentMonth = currentMonth;

	for (let y = currentYear; y >= currentYear - 2; y--)
	{
	    for (let m = tmpCurrentMonth; m > 0; m--)
		    div.innerHTML += `<option value="${m}/${y}">${m.toString().padStart(2, 0)}/${y.toString().slice(-2)}</option>`
	    tmpCurrentMonth = 12;
	}
}

function extract_forum_nicknames(body)
{
	return [...body.matchAll(/(\w+)<span class="font-s couleur-hashtag-pseudo"> #(\d+)<\/span>.+?"\/img\/pays\/(..)\.png"/g)].sort();
}

function extract_forum_data(countryCode)
{
	fetch(forum_url)
		.then(body => body.text())
		.then(body => extract_forum_nicknames(body))
		.then(body => {
			for (let member of body)
				if (member[3] == countryCode)
					newField("nicknames", '', member[1] + "#" + member[2]);
		})
		.then(body => generate())
}

function capitalize(e)
{
	e = e.toLowerCase();
	return e.charAt(0).toUpperCase() + e.slice(1);
}

function checkTag(e)
{
	if (e.indexOf('#') == -1)
		e += "#0010";
	return e;
}

function getNicknameList()
{
	let nicknamesList = [ ];
	for (let nickname = 0; nickname <= valueField["nicknames"]; nickname++)
	{
		let value = document.getElementById("nicknames_" + nickname).value.trim();
		if (value)
			nicknamesList.push(checkTag(capitalize(value)));
	}
	return nicknamesList.join(',');
}

function getPatternList()
{
	let patternsList = [ ];
	for (let pattern = 0; pattern <= valueField["patterns"]; pattern++)
	{
		let value = document.getElementById("pattern_value_" + pattern).value.trim();
		let type = document.getElementById("pattern_type_" + pattern).value;

		if (value || type)
		{
			if (type)
			{
				type = "#" + type;

				if (value)
					value += type;
				else
					value = type;
			}

			patternsList.push(value);
		}
	}
	return patternsList.join(',');
}

function generate()
{
	copyButton.innerHTML = "Copy to clipboard";

	let cmdStr = "/senti ";
	cmdStr += `nick=[${getNicknameList()}]`;

	let patternsList = getPatternList();
	if (patternsList)
		cmdStr += ` reason=[${patternsList}]`;

	let month_year = monthYear.value.split('/');

	let month = month_year[0] != currentMonth ? month_year[0] : null;
	if (month)
		cmdStr += ` month=${month}`;

	let year = month_year[1] != currentYear ? month_year[1] : null;
	if (year)
		cmdStr += ` year=${year}`;

	if (displayMembers.checked)
		cmdStr += ` members=${displayMembers.checked}`;

	if (allTime.checked)
		cmdStr += ` alltime=${allTime.checked}`;

	if (!warn.checked)
		cmdStr += ` warn=${warn.checked}`;

	if (!report.checked)
		cmdStr += ` report=${report.checked}`;

	if (!message.checked)
		cmdStr += ` message=${message.checked}`;

	if (debugData.checked)
		cmdStr += ` debug=${debugData.checked}`;

	result.value = cmdStr;

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
	document.getElementById("add_nickname").click();
	populateMonthAndYear();

	size = document.getElementById("size");
	copyButton = document.getElementById("copy");
	monthYear = document.getElementById("month_year");
	displayMembers = document.getElementById("display_members");
	allTime = document.getElementById("all_time");
	warn = document.getElementById("warn");
	report = document.getElementById("report");
	message = document.getElementById("message");
	debugData = document.getElementById("debug_data");
	result = document.getElementById("result");
}
