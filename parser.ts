import { PieceType, Piece, ElementCollection, KeyValue } from "./types.ts";

const VAR_INDICATOR = '$', STATEMENT_INDICATOR = '#', SLASH = '\\';
const CONTENT_KEY = 'content';
const TAG_START = '<', TAG_END = '>', TAG_CLOSE = '/', TAG_STARTCLOSE = "</", TAG_ASIGN = '=', QUOTE = '"';
const SPACE = ' ', TAB = '	';
const IMPORT_TAG = "import";

const IMPORT_ELEMENT =
{
	pieces:[{ type: PieceType.text, value: "" }],
	script: [],
	style: []
};

function ensureVal(input: string, index: number, values: string[]) : boolean
{
	for (let i = 0; i < values.length; i++)
	{
		if (input[index] === values[i]) return true;
	}

	return false;
}

function getTag(start: number, input: string) : string
{
	let result = "";

	for (let i = start; i < input.length; i++)
	{
		if (ensureVal(input, i, [SPACE, TAB, TAG_END, TAG_CLOSE])) break;
		else result += input[i];
	}

	return result;
}

function getTagArgs(tag: string, currentIndex: number, input: string, dict: KeyValue) : number
{
	let readingContent = false, readingValue = false;
	let notLast = true;
	let currentKey = "";

	for (; currentIndex < input.length; currentIndex++)
	{
		if (readingContent)
		{
			if (input[currentIndex] === TAG_START && input.length - 1 > currentIndex + tag.length + 1
				&& input.substring(currentIndex, currentIndex + tag.length + 3) === `${TAG_STARTCLOSE}${tag}${TAG_END}`)
			{
				currentIndex += tag.length + 2;

				break;
			}

			dict[CONTENT_KEY] += input[currentIndex];
		}
		else
		{
			if (input[currentIndex] === TAG_CLOSE && input.length - 1 > currentIndex && input[currentIndex + 1] === TAG_END)
			{
				currentIndex++;

				break;
			}
			else if (input[currentIndex] === TAG_END)
			{
				readingContent = true;
				
				if (dict[CONTENT_KEY] === undefined) dict[CONTENT_KEY] = "";

				continue;
			}
			
			if (!readingValue)
			{
				if (!ensureVal(input, currentIndex, [SPACE, TAB]))
				{
					if (currentKey.length > 0 && input[currentIndex] === TAG_ASIGN)
					{
						readingValue = true;
						dict[currentKey] = "";
					}
					else currentKey += input[currentIndex];
				}
			}
			else
			{
				if (dict[currentKey].length === 0)
				{
					if (input.length - 1 > currentIndex && input[currentIndex] === QUOTE)
					{
						dict[currentKey] += input[currentIndex + 1];
						currentIndex++;
					}
				}
				else
				{
					if (input[currentIndex] === SLASH && input.length - 1 > currentIndex && input[currentIndex + 1] === QUOTE)
					{
						currentIndex++;
						dict[currentKey] += input[currentIndex];
					}
					else if (input[currentIndex] === QUOTE)
					{
						currentKey = "";
						readingValue = false;
					}
					else dict[currentKey] += input[currentIndex];
				}
			}
		}
	}

	return currentIndex;
}

function elementIntoPieces(tag: string, element: Piece[], currentIndex: number, input: string, pieces: Piece[]) : number
{
	const args : KeyValue = {};
	currentIndex = getTagArgs(tag, currentIndex, input, args);
	let readingVar = false;
	let add = "", current = "";

	for (const piece of element)
	{
		if (piece.type === PieceType.variable) pieces.push({ type: PieceType.text, value: args[piece.value] });
		else pieces.push(piece);
	}

	return currentIndex;
}

function formatCSS(css: string) { return `<link rel="stylesheet" href="${css}" />`; }

function formatJS(js: string) { return `<script rel="text/javascript" src="${js}" defer></script>`; }

export function compile(input: string, elements: ElementCollection) : Piece[]
{
	const result = [];
	let reading = null;
	let current = "";
	let notLast = true;
	const tags = [];
	let importIndex = -1;
	let imports = "";

	if (elements[IMPORT_TAG] === undefined) elements[IMPORT_TAG] = IMPORT_ELEMENT;

	for (let i = 0; i < input.length; i++)
	{
		notLast = input.length - 1 > i;

		if (input[i] === SLASH && notLast)
		{
			if (ensureVal(input, i + 1, [SLASH, VAR_INDICATOR, STATEMENT_INDICATOR]))
			{
				i++;
				current += input[i];
			}
		}
		else if (ensureVal(input, i, [VAR_INDICATOR, STATEMENT_INDICATOR]))
		{
			if (reading === null)
			{
				result.push({ type: PieceType.text, value: current });

				current = "";
				reading = input[i];
			}
			else
			{
				result.push({ type: reading === VAR_INDICATOR ? PieceType.variable : PieceType.statement, value: current });

				current = "";
				reading = null;
			}
		}
		else if (reading === null && input[i] === TAG_START && notLast && input[i + 1] !== TAG_CLOSE)
		{
			const tag = getTag(i + 1, input);
			const element = elements[tag];

			if (element !== undefined)
			{
				if (tag === IMPORT_TAG) importIndex = result.length;

				result.push({ type: PieceType.text, value: current });

				current = "";
				i = elementIntoPieces(tag, element.pieces, i + tag.length + 1, input, result);

				if (tags.indexOf(tag) === -1)
				{
					tags.push(tag);
					
					for (const js of element.script) imports += formatJS(js);

					for (const css of element.style) imports += formatCSS(css);
				}
			}
			else
			{
				current += input.substring(i, i + tag.length + 1);
				i += tag.length;
			}
		}
		else current += input[i];
	}

	if (current.length > 0) result.push({ type: PieceType.text, value: current });

	if (importIndex !== -1) result[importIndex].value = imports;

	return result;
}
