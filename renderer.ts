import { PieceType, Piece, KeyValue } from "./types.ts";

const IF = "if", END_IF = "endif", SPACE = ' ';

export function render(page: Piece[], args: KeyValue) : string
{
	let output = "";
	const show : boolean[] = [];
	let showCurrent = true;

	for (const piece of page)
	{
		showCurrent = show.length === 0 || show[show.length - 1];

		switch (piece.type)
		{
			case PieceType.text:
				if (showCurrent) output += piece.value;
				break;
			case PieceType.variable:
				if (showCurrent) output += args[piece.value];
				break;
			case PieceType.statement:
				if (piece.value === END_IF) show.pop();
				else
				{
					const split = piece.value.split(SPACE);
					
					if (split[0] === IF)
					{
						if (split.length > 1) show.push(showCurrent && args[split[1]]);
						else show.push(showCurrent);
					}
				}
				break;
		}
	}

	return output;
}
