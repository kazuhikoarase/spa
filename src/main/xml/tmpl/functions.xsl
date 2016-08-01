<?xml version="1.0" encoding="Utf-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:variable name="lowers">abcdefghijklmnopqrstuvwxyz</xsl:variable>
<xsl:variable name="uppers">ABCDEFGHIJKLMNOPQRSTUVWXYZ</xsl:variable>

<!-- 小文字に変換 -->
<xsl:template name="LowerCase">
    <xsl:param name="s"/>
    <xsl:value-of select="translate($s, $uppers, $lowers)" />
</xsl:template>

<!-- 大文字に変換 -->
<xsl:template name="UpperCase">
    <xsl:param name="s"/>
    <xsl:value-of select="translate($s, $lowers, $uppers)" />
</xsl:template>

<!-- キャメルケースに変換(1ワード) -->
<xsl:template name="SingleCamel">
    <xsl:param name="s"/>
    <xsl:call-template name="UpperCase"><xsl:with-param name="s" select="substring($s, 1, 1)" /></xsl:call-template>
    <xsl:call-template name="LowerCase"><xsl:with-param name="s" select="substring($s, 2, string-length($s) - 1)" /></xsl:call-template>
</xsl:template>

<!-- 頭の1文字のみ大文字に変換する -->
<xsl:template name="UpperHead">
    <xsl:param name="s"/>
    <xsl:call-template name="UpperCase"><xsl:with-param name="s" select="substring($s, 1, 1)" /></xsl:call-template>
    <xsl:value-of select="substring($s, 2, string-length($s) - 1)" />
</xsl:template>

<!-- 頭の1文字のみ小文字に変換する -->
<xsl:template name="LowerHead">
    <xsl:param name="s"/>
    <xsl:call-template name="LowerCase"><xsl:with-param name="s" select="substring($s, 1, 1)" /></xsl:call-template>
    <xsl:value-of select="substring($s, 2, string-length($s) - 1)" />
</xsl:template>

<!-- キャメルケースに変換(区切り文字で複数ワード) -->
<xsl:template name="CamelCase">

    <xsl:param name="s"/>
    <xsl:param name="delimiter" select="'_'"/>
    <xsl:param name="lower" select="''"/>

    <xsl:variable name="before"><xsl:value-of select="substring-before($s, $delimiter)"/></xsl:variable>
    <xsl:variable name="after"><xsl:value-of select="substring-after($s, $delimiter)"/></xsl:variable>

    <xsl:choose>

        <xsl:when test="string-length($after) > 0 or string-length($before) > 0">
            <xsl:if test="string-length($before) > 0">
                <xsl:if test="not($lower)">
                    <xsl:call-template name="SingleCamel"><xsl:with-param name="s" select="$before"/></xsl:call-template>
                </xsl:if>
                <xsl:if test="$lower">
                    <xsl:call-template name="LowerCase"><xsl:with-param name="s" select="$before"/></xsl:call-template>
                </xsl:if>
            </xsl:if>
            <xsl:if test="string-length($after) > 0">
              <xsl:call-template name="CamelCase"><xsl:with-param name="s" select="$after" /></xsl:call-template>
            </xsl:if>
        </xsl:when>

        <xsl:when test="string-length($s) > 0 and not(contains($s, '_') )">
            <xsl:if test="not($lower)">
                <xsl:call-template name="SingleCamel"><xsl:with-param name="s" select="$s" /></xsl:call-template>
            </xsl:if>
            <xsl:if test="$lower">
                <xsl:call-template name="LowerCase"><xsl:with-param name="s" select="$s" /></xsl:call-template>
            </xsl:if>
        </xsl:when>

    </xsl:choose>

</xsl:template>

</xsl:stylesheet>
