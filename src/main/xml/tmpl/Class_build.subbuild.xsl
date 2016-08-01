<?xml version="1.0" encoding="Utf-8" ?>
<xsl:stylesheet version="1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cls="urn:Class">

  <xsl:import href="functions.xsl"/>

  <xsl:output method="xml"/>

  <xsl:param name="srcname"/>
  <xsl:param name="srcdir"/>

  <xsl:template match="/cls:Class">

    <xsl:variable name="className" select="substring-before($srcname, '.')"/>
    <xsl:variable name="packageName" select="translate($srcdir, '/', '.')"/>

    <project default="all">

      <property name="build.dir" location="."/>
      <property name="src.dir" location="."/>
      <property name="dst.dir" location="."/>
      <property name="xslt.style" value=""/>
      <property name="xslt.extention" value=""/>

      <target name="all" depends="build"/>

      <target name="build">
      <echo>[Enter] subbuild for <xsl:value-of select="$srcdir"/>/<xsl:value-of select="$srcname"/></echo>
      <xsl:for-each select=".|.//cls:Struct">

        <xsl:variable name="classNameSuffix">
          <xsl:for-each select="ancestor-or-self::cls:Struct">
            <xsl:text>_</xsl:text>
            <xsl:call-template name="UpperHead">
              <xsl:with-param name="s" select="@name"/>
            </xsl:call-template>
          </xsl:for-each>
        </xsl:variable>

        <xslt 
          basedir="${{src.dir}}/{$srcdir}"
          destdir="${{dst.dir}}/{$srcdir}"
          includes="{$srcname}" 
          style="${{build.dir}}/${{xslt.style}}"
          extension="{$classNameSuffix}${{xslt.extention}}">
          <param name="packageName" expression="{$packageName}"/>
          <param name="className" expression="{$className}"/>
          <param name="classNameSuffix" expression="{$classNameSuffix}"/>
        </xslt>
        
      </xsl:for-each>
      <echo>[Exit]</echo>

      </target>

    </project>
  
  </xsl:template>

</xsl:stylesheet>
