enum HtmlParserContext {
	ATTRIBUTE_NAME,
	ATTRIBUTE_SPACE_BEFORE,
	ATTRIBUTE_SPACE_AFTER,
	ATTRIBUTE_VALUE,
	CLOSING_TAG,
	COMMENT,
	TAG_NAME,
	TAG_SPACE,
	TEXT_NODE
}
export default HtmlParserContext;