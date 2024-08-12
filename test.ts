import { PieceType, Piece, Element, ElementCollection } from "./types.ts";
import { compile } from "./parser.ts";
import { render } from "./renderer.ts";
import { assertEquals } from "jsr:@std/assert@1";

Deno.test("Template Test", async (t) =>
{
	const elements : ElementCollection = {};
	const cardInput = '<div><img src="$image$"><h1>$content$</h1></div>';
	const cardExpected =
	[
		{ type: PieceType.text, value: '<div><img src="' },
		{ type: PieceType.variable, value: 'image' },
		{ type: PieceType.text, value: '"><h1>' },
		{ type: PieceType.variable, value: 'content' },
		{ type: PieceType.text, value: '</h1></div>' }
	];
	
	await t.step("Creating an element", () =>
	{
		elements.card = { pieces: compile(cardInput, elements), scripts: ["#"], styles: ["#"] };

		assertEquals(elements.card.pieces, cardExpected);
	});

	const pageInput = '<import /><body><card image="#">Meu Card 1</card><card image="#" content="Meu Card 2" />#if show#Meu texto#endif#</body>';
	const expectedRender1 = '<script rel="text/javascript" src="#" defer></script><link rel="stylesheet" href="#" /><body><div><img src="#"><h1>Meu Card 1</h1></div><div><img src="#"><h1>Meu Card 2</h1></div>Meu texto</body>'; 
	const expectedRender2 = '<script rel="text/javascript" src="#" defer></script><link rel="stylesheet" href="#" /><body><div><img src="#"><h1>Meu Card 1</h1></div><div><img src="#"><h1>Meu Card 2</h1></div></body>';

	await t.step("Rendering a template", () =>
	{
		assertEquals(render(compile(pageInput, elements), { show: true }), expectedRender1);
		assertEquals(render(compile(pageInput, elements), { show: false }), expectedRender2);
	});
});

Deno.test("Special characters", () =>
{
	const input = "\\$<br>\\\\";
	const expected = "$<br>\\";

	assertEquals(render(compile(input, {}), {}), expected);
});
