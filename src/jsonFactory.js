const jsonFactory = {
    //字典
    type_dict: {
        short: '                "type":"integer",\n                "maximum":32767,\n                "minimun":-32768',
        int: '                "type":"integer",\n                "maximum":2147483647,\n                "minimun":-2147483648',
        long: '                "type":"integer",\n                "maximum":2147483647,\n                "minimun":-2147483648',
        float: '                "type":"string",\n                "pattern":"^([-+]?[0-9]*\\\\\\\\.?[0-9]+)$\|([0-9]+([eE][0-9]+))"',
        double: '                "type":"string",\n                "pattern":"^([-+]?[0-9]*\\\\\\\\.?[0-9]+)$\|([0-9]+([eE][0-9]+))"',
        char: '                "type":"string",\n                "maxLength":1,\n                "minLength":1',
        char_p: '                "type":"string"',
        char_a: '                "type":"string",\n                "maxLength":'
    },
    schema: '',
    schema_head: '\
    {\n\
        "$schema": "http:\\/\\/json-schema.org/draft-07/schema",\n\
        "type": "object",\n\
        "description": "A c struct",\n\
        "title": "struct schema",\n\
    ',
    schema_required_start: '\
        "required": [\n\
    ',
    schema_required_end: '\n    ],\n',
    schema_properties_start: '\
        "properties": {\n\
    ',
    schema_properties_end: '    }\n',
    schema_end: '}',


    property_required: '',
    property_properties: '',
    //字符串拼接Schema
    schemaJoint(struct_list) {
        let schema_required = this.schema_required_start;
        let schema_properties = this.schema_properties_start;
        for (let i = 0; i < struct_list.length; i++) {
            if (i != 0) {
                schema_required += ",\n";
                schema_properties += ",\n";
            }
            schema_required += '        "' + this.getStructName(struct_list[i]) + '"';
            schema_properties += this.getProperty(struct_list[i]);
        }
        var schema = this.schema_head + schema_required + this.schema_required_end + schema_properties + this.schema_properties_end + this.schema_end;
        // console.log("schema："+schema);
        return schema;
    },

    /**
     *从struct字符串中提取结构体名
    */
    getStructName(str) {
        return str.match(/struct (.*)/)[1];
    },

    /**
     * 从每个struct字符串中提取结构体的变量
     */
    getProperty(str) {
        let title = this.getStructName(str);
        let property_head = '    "' + title + '":{\n\
            "description":"' + title + ' struct",\n\
            "type":"array",\n\
            "item":{\n\
                "type":"object",\n\
            '
        let property_end = '    }\n}\n';
        this.property_required = this.schema_required_start;
        this.property_properties = '    ' + this.schema_properties_start;
        let property_required_end = this.schema_required_end;
        let property_properties_end = '\n    ' + this.schema_properties_end;
        let property_list = str.replace(/(.|\n)*{|};|\n/g, "").replace(/struct .*/, "").split(';');
        for (let i = 0; i < property_list.length - 1; i++) {
            this.proportyDeal(property_list[i], i >= property_list.length - 2);
        }
        let property = property_head + this.property_required + property_required_end + this.property_properties + property_properties_end + property_end;
        return property;
    },

    /**
     * 逐句处理属性定义语句
     * @param {string} str 结构体内变量定义语句字符串，不含分号
     * @param {boolean} last 是否为最后一个变量
     */
    proportyDeal(str, last = false) {
        let is_point = false;//指针
        let is_array = false;//数组
        let array_length;//数组长度
        //判断是否为指针类型
        if (str.indexOf("*") != -1) {
            is_point = true;
            str = str.replace(/\*/, " ");
        }
        //去掉多余的空格和回车
        str = str.replace(/(^ +|\s *)+/, "").replace(/ +/, " ");
        var var_list = str.split(" ");
        var var_type = var_list[0];
        var var_name = var_list[1];
        if (var_name.search(/\[\d*\]/) != -1) {
            is_array = true;
            array_length = var_name.slice(var_name.search(/\[\d*\]/) + 1, -1);
            var_name = var_name.replace(/\[\d*\]/, "");
        }
        // console.log(var_type);

        //添加到required和properties
        this.addRequired(var_name, last);
        this.addProperties(var_name, var_type, is_point, is_array, array_length, last);
    },

    //拼接required属性
    addRequired(required_keyword, last = false) {
        this.property_required += this.jsonString(required_keyword, 16, last);
    },

    //拼接properties属性
    addProperties(properties_name, properties_type, point_flag, array_flag, array_length, last = false) {
        if (point_flag == true) properties_type += '_p';
        if (array_flag == true) properties_type += '_a';
        let description = this.jsonString('description": "properties of struct variable', 16);

        let type = this.type_dict[properties_type];
        //如果数组长度大于0
        if (array_length > 0) type += String(array_length)
        let properties_end = last ? '\n            }\n' : '\n            },\n';
        this.property_properties += this.jsonObject(properties_name, 12) + description + type + properties_end;
    },

    //JSON字符串
    jsonString(str, tabNum = 0, last = false) {
        var start = '"'
        var end = '",\n'
        for (var i = 0; i < tabNum; i++)start = ' ' + start;
        if (last) end = '"\n'
        return start + str + end;
    },

    //JSON对象
    jsonObject(str, tabNum = 0) {
        var start = '"'
        for (var i = 0; i < tabNum; i++)start = ' ' + start;
        return start + str + '": {\n';
    }
}

module.exports = jsonFactory