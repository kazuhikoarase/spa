<?xml version="1.0" encoding="Utf-8" ?>
<xsl:stylesheet version="1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:cls="urn:Class">

<xsl:import href="functions.xsl"/>
<xsl:output method="text" encoding="Utf-8"/>
<xsl:param name="packageName"/>
<xsl:param name="className"/>
<xsl:param name="classNameSuffix"/>
<xsl:variable name="actionFormClass">com.example.struts.ActionFormBase</xsl:variable>
<xsl:variable name="types" select="document('Class_types.xml')/Types"/>

<!--
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
-->
<xsl:template match="cls:Class">
<xsl:variable name="extends" select="@extends"/>

<xsl:text/>// 自動生成されたファイルです。 編集しないでください。*

package <xsl:value-of select="$packageName"/>;

/**
 * <xsl:value-of select="@comment"/>
 * @author Apache Ant
 */
@SuppressWarnings("serial")
public class <xsl:value-of select="$className"/><xsl:value-of select="$classNameSuffix"/>
<xsl:if test="$extends"> extends <xsl:value-of select="$extends"/></xsl:if>
implements java.io.Serializable {

  /** 
   * コンストラクタ
   */
  public <xsl:value-of select="$className"/><xsl:value-of select="$classNameSuffix"/>() {
  }
  <xsl:for-each select=".|.//cls:Struct">

    <xsl:variable name="currentClassNameSuffix">
      <xsl:for-each select="ancestor-or-self::cls:Struct">
        <xsl:text>_</xsl:text>
        <xsl:call-template name="UpperHead">
          <xsl:with-param name="s" select="@name"/>
        </xsl:call-template>
      </xsl:for-each>
    </xsl:variable>
    <xsl:if test="$classNameSuffix = $currentClassNameSuffix">

      <xsl:apply-templates select="cls:Property|cls:Struct|cls:Script" mode="def"/>

      <xsl:if test="$extends=$actionFormClass">
        <xsl:apply-templates select="cls:Property|cls:Struct" mode="errorDef"/>
      </xsl:if>
  /**
   * 文字列表現を取得する。
   * @return 文字列表現
   */ 
  @Override
  public String toString() {
    StringBuilder s = new StringBuilder();
    s.append(super.toString() );
    s.append("{");<xsl:text/>
      <xsl:apply-templates select="cls:Property|cls:Struct" mode="toString"/>
    s.append("}");
    return s.toString();
  }</xsl:if>
  </xsl:for-each>
}

</xsl:template>

<!--
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
-->
<xsl:template match="cls:Struct" mode="def">
  <xsl:variable name="propertyName" select="@name"/>

  <xsl:variable name="currentClassNameSuffix">
    <xsl:for-each select="ancestor-or-self::cls:Struct">
      <xsl:text>_</xsl:text>
      <xsl:call-template name="UpperHead">
        <xsl:with-param name="s" select="@name"/>
      </xsl:call-template>
    </xsl:for-each>
  </xsl:variable>

  <xsl:call-template name="PropertyDef">
    <xsl:with-param name="name" select="$propertyName"/>
    <xsl:with-param name="comment" select="@comment"/>
    <xsl:with-param name="type" select="concat($className, $currentClassNameSuffix)"/>
    <xsl:with-param name="collectionType" select="@collectionType"/>
  </xsl:call-template>
</xsl:template>

<!--
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
-->
<xsl:template match="cls:Property" mode="def">
  <xsl:call-template name="PropertyDef">
    <xsl:with-param name="name" select="@name"/>
    <xsl:with-param name="comment" select="@comment"/>
    <xsl:with-param name="type" select="@type"/>
    <xsl:with-param name="customType" select="@customType"/>
    <xsl:with-param name="collectionType" select="@collectionType"/>
  </xsl:call-template>
</xsl:template>

<!--
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
-->
<xsl:template match="cls:Property" mode="errorDef">
  <xsl:call-template name="PropertyErrorDef">
    <xsl:with-param name="name" select="@name"/>
    <xsl:with-param name="comment" select="@comment"/>
    <xsl:with-param name="type" select="@type"/>
    <xsl:with-param name="customType" select="@customType"/>
    <xsl:with-param name="collectionType" select="@collectionType"/>
  </xsl:call-template>
</xsl:template>

<!--
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
-->
<xsl:template match="cls:Struct" mode="errorDef">
  <xsl:variable name="propertyName" select="@name"/>

  <xsl:variable name="currentClassNameSuffix">
    <xsl:for-each select="ancestor-or-self::cls:Struct">
      <xsl:text>_</xsl:text>
      <xsl:call-template name="UpperHead">
        <xsl:with-param name="s" select="@name"/>
      </xsl:call-template>
    </xsl:for-each>
  </xsl:variable>

  <xsl:call-template name="PropertyErrorDef">
    <xsl:with-param name="name" select="$propertyName"/>
    <xsl:with-param name="comment" select="@comment"/>
    <xsl:with-param name="type" select="concat($className, $currentClassNameSuffix)"/>
    <xsl:with-param name="collectionType" select="@collectionType"/>
  </xsl:call-template>
</xsl:template>

<!--
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
-->
<xsl:template match="cls:Struct" mode="toString">
  <xsl:variable name="propertyName" select="@name"/>

  <xsl:variable name="currentClassNameSuffix">
    <xsl:for-each select="ancestor-or-self::cls:Struct">
      <xsl:text>_</xsl:text>
      <xsl:call-template name="UpperHead">
        <xsl:with-param name="s" select="@name"/>
      </xsl:call-template>
    </xsl:for-each>
  </xsl:variable>

  <xsl:call-template name="PropertyToString">
    <xsl:with-param name="name" select="$propertyName"/>
    <xsl:with-param name="comment" select="@comment"/>
    <xsl:with-param name="type" select="concat($className, $currentClassNameSuffix)"/>
    <xsl:with-param name="collectionType" select="@collectionType"/>
  </xsl:call-template>
</xsl:template>

<!--
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
-->
<xsl:template match="cls:Property" mode="toString">
  <xsl:call-template name="PropertyToString">
    <xsl:with-param name="name" select="@name"/>
    <xsl:with-param name="comment" select="@comment"/>
    <xsl:with-param name="type" select="@type"/>
    <xsl:with-param name="customType" select="@customType"/>
    <xsl:with-param name="collectionType" select="@collectionType"/>
  </xsl:call-template>
</xsl:template>

<!--
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
-->
<xsl:template match="cls:Script" mode="def">
  <xsl:if test="@lang='java'">
    <xsl:value-of select="."/>
  </xsl:if>
</xsl:template>

<!--
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
-->
<xsl:template name="PropertyDef">
  <xsl:param name="name"/>
  <xsl:param name="comment"/>
  <xsl:param name="type"/>
  <xsl:param name="customType"/>
  <xsl:param name="collectionType"/>
  <xsl:variable name="Name">
  <xsl:call-template name="UpperHead">
    <xsl:with-param name="s" select="$name"/>
  </xsl:call-template>
  </xsl:variable>

    <xsl:variable name="getterPrefix">
      <xsl:choose>
        <xsl:when test="$type = 'boolean'">is</xsl:when>
        <xsl:otherwise>get</xsl:otherwise>
    </xsl:choose>
    </xsl:variable>

  <xsl:variable name="typeMapping" select="$types/Type[@name=$type]/TypeMapping[@lang='java']"/>

  <xsl:variable name="className">
    <xsl:choose>
      <xsl:when test="$typeMapping">
         <xsl:value-of select="$typeMapping/@type"/>
      </xsl:when>
      <xsl:when test="$type = 'custom'">
         <xsl:value-of select="$customType"/>
      </xsl:when>
      <xsl:otherwise>
         <xsl:value-of select="$type"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  
<xsl:choose>
<xsl:when test="$collectionType='array'">
  /**
   * <xsl:value-of select="$comment"/>
   */
  private <xsl:value-of select="$className"/>[]<xsl:text> </xsl:text><xsl:value-of select="$name"/>Array;
  
  /**
   * <xsl:value-of select="$comment"/>の配列を取得する。
   * @return <xsl:value-of select="$comment"/>の配列
   */
  public <xsl:value-of select="$className"/>[] get<xsl:value-of select="$Name"/>Array() {
    if (<xsl:value-of select="$name"/>Array == null) {
      <xsl:value-of select="$name"/>Array = new <xsl:value-of select="$className"/>[0];
    }  
    return <xsl:value-of select="$name"/>Array;
  }
  
  /**
   * <xsl:value-of select="$comment"/>の配列を設定する。
   * @param <xsl:value-of select="$name"/>Array<xsl:text> </xsl:text><xsl:value-of select="$comment"/>の配列
   */
  public void set<xsl:value-of select="$Name"/>Array(<xsl:value-of select="$className"/>[]<xsl:text> </xsl:text><xsl:value-of select="$name"/>Array) {
    this.<xsl:value-of select="$name"/>Array = <xsl:value-of select="$name"/>Array;
  }
</xsl:when>
<xsl:when test="$collectionType='list'">
  /**
   * <xsl:value-of select="$comment"/>
   */
  private java.util.List&lt;<xsl:value-of select="$className"/>&gt;<xsl:text> </xsl:text><xsl:value-of select="$name"/>List;
  
  /**
   * <xsl:value-of select="$comment"/>のリストを取得する。
   * @return <xsl:value-of select="$comment"/>のリスト
   */
  public java.util.List&lt;<xsl:value-of select="$className"/>&gt; get<xsl:value-of select="$Name"/>List() {
    if (<xsl:value-of select="$name"/>List == null) {
      <xsl:value-of select="$name"/>List = new java.util.ArrayList&lt;<xsl:value-of select="$className"/>&gt;();
    }
    return <xsl:value-of select="$name"/>List;
  }
  
  /**
   * <xsl:value-of select="$comment"/>のリストを設定する。
   * @param <xsl:value-of select="$name"/>List<xsl:text> </xsl:text><xsl:value-of select="$comment"/>のリスト
   */
  public void set<xsl:value-of select="$Name"/>List(java.util.List&lt;<xsl:value-of select="$className"/>&gt;<xsl:text> </xsl:text><xsl:value-of select="$name"/>List) {
    this.<xsl:value-of select="$name"/>List = <xsl:value-of select="$name"/>List;
  }
</xsl:when>
<xsl:otherwise>
  /**
   * <xsl:value-of select="$comment"/>
   */
  private <xsl:value-of select="$className"/><xsl:text> </xsl:text><xsl:value-of select="$name"/>
  <xsl:if test="string-length($typeMapping/@default) &gt; 0"> = <xsl:value-of select="$typeMapping/@default"/></xsl:if>;
  
  /**
   * <xsl:value-of select="$comment"/>を取得する。
   * @return <xsl:value-of select="$comment"/>
   */
  public <xsl:value-of select="$className"/><xsl:text> </xsl:text><xsl:value-of select="$getterPrefix"/><xsl:value-of select="$Name"/>() {
    return <xsl:value-of select="$name"/>;
  }
  
  /**
   * <xsl:value-of select="$comment"/>を設定する。
   * @param <xsl:value-of select="$name"/><xsl:text> </xsl:text><xsl:value-of select="$comment"/>
   */
  public void set<xsl:value-of select="$Name"/>(<xsl:value-of select="$className"/><xsl:text> </xsl:text><xsl:value-of select="$name"/>) {
    this.<xsl:value-of select="$name"/> = <xsl:value-of select="$name"/>;
  }
</xsl:otherwise>
</xsl:choose>
</xsl:template>

<xsl:template name="PropertyErrorDef">
  <xsl:param name="name"/>
  <xsl:param name="comment"/>
  <xsl:param name="type"/>
  <xsl:param name="customType"/>
  <xsl:param name="collectionType"/>
  <xsl:variable name="Name">
  <xsl:call-template name="UpperHead">
    <xsl:with-param name="s" select="$name"/>
  </xsl:call-template>
  </xsl:variable>
  <xsl:variable name="errorSuffix">_errorString</xsl:variable>
  /**
   * <xsl:value-of select="$comment"/>のエラーを取得する。
   * @return <xsl:value-of select="$comment"/>のエラー
   */
  public String get<xsl:value-of select="$Name"/>
  <xsl:value-of select="$errorSuffix"/>() {
    return getErrorString("<xsl:value-of select="$name"/>");
  }
  
  /**
   * <xsl:value-of select="$comment"/>のエラーを設定する。
   * @param <xsl:value-of select="$name"/>
   <xsl:value-of select="$errorSuffix"/><xsl:text> </xsl:text><xsl:value-of select="$comment"/>のエラー
   */
  public void set<xsl:value-of select="$Name"/>
  <xsl:value-of select="$errorSuffix"/>(String <xsl:value-of select="$name"/>
  <xsl:value-of select="$errorSuffix"/>) {
    setErrorString("<xsl:value-of select="$name"/>", <xsl:value-of select="$name"/>
    <xsl:value-of select="$errorSuffix"/>);
  }
</xsl:template>

<!--
    ////////////////////////////////////////////////

    ////////////////////////////////////////////////
-->
<xsl:template name="PropertyToString">
  <xsl:param name="name"/>
  <xsl:param name="comment"/>
  <xsl:param name="type"/>
  <xsl:param name="customType"/>
  <xsl:param name="collectionType"/>
  <xsl:variable name="Name">
  <xsl:call-template name="UpperHead">
    <xsl:with-param name="s" select="$name"/>
  </xsl:call-template>
  </xsl:variable>

    <xsl:variable name="getterPrefix">
      <xsl:choose>
        <xsl:when test="$type = 'boolean'">is</xsl:when>
        <xsl:otherwise>get</xsl:otherwise>
    </xsl:choose>
    </xsl:variable>

  <xsl:variable name="typeMapping" select="$types/Type[@name=$type]/TypeMapping[@lang='java']"/>

  <xsl:variable name="className">
    <xsl:choose>
      <xsl:when test="$typeMapping">
         <xsl:value-of select="$typeMapping/@type"/>
      </xsl:when>
      <xsl:when test="$type = 'custom'">
         <xsl:value-of select="$customType"/>
      </xsl:when>
      <xsl:otherwise>
         <xsl:value-of select="$type"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:variable>

  <xsl:if test="position()&gt;1">
    s.append(",");<xsl:text/>
  </xsl:if>  

<xsl:choose>
<xsl:when test="$collectionType='array'">
    s.append("<xsl:value-of select="$name"/>=[");
    for (int i = 0; i &lt; get<xsl:value-of select="$Name"/>Array().length; i++) {
      if (i &gt; 0) s.append(",");
      s.append(get<xsl:value-of select="$Name"/>Array()[i]);
    }
    s.append("]");<xsl:text/>
</xsl:when>
<xsl:when test="$collectionType='list'">
    s.append("<xsl:value-of select="$name"/>=[");
    for (int i = 0; i &lt; get<xsl:value-of select="$Name"/>List().size(); i++) {
      if (i &gt; 0) s.append(",");
      s.append(get<xsl:value-of select="$Name"/>List().get(i) );
    }
    s.append("]");<xsl:text/>
</xsl:when>
<xsl:otherwise>
    s.append("<xsl:value-of select="$name"/>=");
    s.append(<xsl:value-of select="$getterPrefix"/><xsl:value-of select="$Name"/>() );<xsl:text/>
</xsl:otherwise>
</xsl:choose>
</xsl:template>

</xsl:stylesheet>
