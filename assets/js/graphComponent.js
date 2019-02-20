var sizecorrection = Math.max(0, 220 - parseInt(window.innerWidth * 0.2));
var data={"nodes": [], "links": []};

var naturalWidth = 892;
var naturalHeight = 1263;
var originWidth = 350;
var originHeight = naturalHeight / naturalWidth > 425 / 300 ? 425 : 350 / (naturalWidth / naturalHeight);
var parallelrendering=false;
var minnodewidth = 50;
var padding = 10;
var labelformat = 0;
var labeltextformat = 0;
var showlinkcount = 0;
var paddingmultiplier = 100;
var lowopacity = 0.25;
var highopacity = 1;
var fixedlayout=[];
var format2Number = d3.format(",.2f"),
    format1Number = d3.format(",.1f"),
    format3Number = d3.format(",.3f"),
    formatNumber = d3.format(",.0f"),
    format = function(a) {
        return formatNumber(a)
    },color = d3.scale.category20();
    linkformat= function(a) {
        return formatNumber(a);
    },
    nodeformat= function(a) {
        return formatNumber(a);
    };

    change = function(d) {

        labelformat = 1; // 展示标签
        labeltextformat = 0; // 不展示文字
        showlinkcount = 0; // 不展示数字
        leftLength = d.nodes.filter((item) => item.layer !== 2).length;
        rightLength = d.nodes.filter((item) => item.layer === 2).length;
        padding = 5;
        d3.select("#chart").style("width", document.getElementById("chart").offsetWidth - sizecorrection)
        var margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        },
        width = document.getElementById("chart").offsetWidth - margin.left - margin.right,
        height = d.flag ?
            (leftLength > rightLength ? leftLength * 85 + (leftLength - 1) * padding : rightLength * 85 + (rightLength - 1) * padding) :
                (leftLength > rightLength ? leftLength * 55 + (leftLength - 1) * padding : rightLength * 55 + (rightLength - 1) * padding);

        var svg = d3.select("#chart").append("svg")
        svg=svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        // 桑基图
        var sankey = d3.sankey().nodeWidth(60).nodePadding(padding).size([width, height]);
        var path = sankey.reversibleLink();
        svg.selectAll("g").remove();
        sankey = d3.sankey().nodeWidth(60).nodePadding(padding).size([width, height]);
        sankey.nodes(d.nodes).links(d.links).layout(500);
        var g = svg.append("g") //link
            .selectAll(".link").data(d.links).enter().append("g").attr("class", "link").sort(function(j, i) {
                return i.dy - j.dy
            });
        var h = g.append("path") //path0
            .attr("d", path(0));
        var f = g.append("path") //path1
            .attr("d", path(1));
        var e = g.append("path") //path2
            .attr("d", path(2));
        g.attr("fill", function(i) {
            if (i.fill) return i.fill;
            else if (i.source.fill) return i.source.fill;
            else return i.source.color = color(i.source.name.replace(/ .*/, ""))
        }).attr("opacity", lowopacity).on("mouseover", function(d) {
            d3.select(this).style('opacity', highopacity);
        }).on("mouseout", function(d) {
            d3.select(this).style('opacity', lowopacity);
        }).append("title") //link
        .text(function(i) {
            return i.source.name + " → " + i.target.name
        });
        var c = svg.append("g") //node
            .selectAll(".node")
            .data(d.nodes).enter().append("g").attr("class", "node").attr("transform", function(i) {
                return "translate(" + i.x + "," + i.y + ")"
            }).call(d3.behavior.drag().origin(function(i) {
                return i
            }).on("dragstart", function() {
                this.parentNode.appendChild(this)
            }).on("drag", dragMove));

        // 添加节点图片
        c.append("image")
            .attr("xlink:href", function(i) {
                if (i.layer === 2) {
                    return "./assets/img/server.png";
                } else if (!d.flag) {
                    return "./assets/img/lock.png"
                }
            })
            .style("outline", function(i) {
                if (i.layer !== 2) {
                    return "rgb(230, 228, 228) solid 1px";
                }
            })
            .style("padding-bottom", "20px")
            .attr("height", function(i) {
                if (i.layer !== 2) {
                    if (d.flag) {
                        return 85;
                    }
                    return 55;
                }
                return 55;
            })
            .attr("width", function(i) {
                if (Math.sqrt(leftLength) % 1 === 0) {
                    return 60;
                } else {
                    if (d.flag) {
                        if (leftLength <= 3) {
                            if (i.layer !== 2) {
                                return 85 / originHeight * leftLength * originWidth;
                            }
                            return 60;
                        } else {
                            if (i.layer !== 2) {
                                return originWidth;
                            }
                            return 60;
                        }
                    } else {
                        return 60;
                    }
                }
            })
            .on("mouseover", function(d) {
                svg.selectAll(".link").filter(function(l) {
                    return l.source == d || l.target == d;
                }).transition().style('opacity', highopacity);
            }).on("mouseout", function(d) {
                svg.selectAll(".link").filter(function(l) {
                    return l.source == d || l.target == d;
                }).transition().style('opacity', lowopacity);
            }).on("dblclick", function(d) {
                svg.selectAll(".link").filter(function(l) {
                    return l.target == d;
                }).attr("display", function() {
                    if (d3.select(this).attr("display") == "none") return "inline"
                    else return "none"
                });
            })
            .append("title").text(function(i) {
                if (i.layer !== 2) { return "碎片：" + i.name; }
                return "IPFS集群节点名：" + i.name + "\n" + "IPFS集群节点ip地址：127.0.0.1";
            });

        // 添加左右两边节点文字描述
        c.append("text")
            .attr("x", -6).attr("y", function(i) {
                if (i.layer !== 2) { return i.sourceLinks[0].sy + i.sourceLinks.length * 12.8 / 2; }
                    return i.targetLinks[0].ty + i.targetLinks.length * 12.8 / 2;
                }).attr("dy", ".35em").attr("text-anchor", "end").attr("font-size","13px")
                .attr("font-weight", "bold").attr("fill", "grey")
                .text(function(i) {
                if (labeltextformat<1){
                        if (i.layer !== 2) { return ""; }
                        return i.name;
                    } else {
                        return "";
                    }
                }).filter(function(i) {
                    return i.x < width / 2
                }).attr("x", d.flag ? 
                    (Math.sqrt(leftLength) % 1 === 0 ?
                        6 + sankey.nodeWidth() : (leftLength <= 3 ?
                            6 + sankey.nodeWidth() + 85 / originHeight * leftLength * originWidth - 60 : 6 + sankey.nodeWidth() + 240)) :
                    6 + sankey.nodeWidth()
                )
                .attr("text-anchor", "start");
                
        function dragMove(i) { //dragmove
            // 限制只可以移动服务器节点
            if (i.layer === 2) {
                d3.select(this).attr("transform", "translate(" + (i.x = Math.max(0, Math.min(width - i.dx, d3.event.x))) + "," + (i.y = Math.max(0, Math.min(height - i.dy, d3.event.y))) + ")")
                sankey.relayout();
                f.attr("d", path(1));
                h.attr("d", path(0));
                e.attr("d", path(2));
            }
        };
    };
        