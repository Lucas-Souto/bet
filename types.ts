export enum PieceType
{
	text = 0,
	variable,
	statement
}

export interface Piece
{
	type: PieceType;
	value: string;
}

export interface Element
{
	pieces: Piece[];
	script: string[];
	style: string[];
}

export type ElementCollection =
{
	[dict_key: string]: Element;
};

export type KeyValue =
{
	[dict_key: string]: any;
};
