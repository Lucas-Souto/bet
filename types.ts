/**
 * Defines the possible types of a {@link Piece}
 */
export enum PieceType
{
	/** The value is a HTML text. */
	text = 0,
	/** The value is a variable name. */
	variable,
	/** The value is a statement name (ex.: if, endif). */
	statement
}

/**
 * Represents a piece of a compiled template.
 */
export interface Piece
{
	type: PieceType;
	value: string;
}

/**
 * Represents an compiled template, with asset dependencies.
 */
export interface Element
{
	pieces: Piece[];
	scripts: string[];
	styles: string[];
}

/**
 * Represents a dictionary<string, {@link Element}>
 */
export type ElementCollection =
{
	[dict_key: string]: Element;
};

/**
 * Represents a dictionary<string, any>.
 */
export type KeyValue =
{
	[dict_key: string]: any;
};
