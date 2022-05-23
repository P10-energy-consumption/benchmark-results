/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5963327646447094, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.537689329548719, 500, 1500, "[PET] GET PET BY ID"], "isController": false}, {"data": [0.6691503582222035, 500, 1500, "[STORE] GET ORDER BY ID AFTER UPDATE"], "isController": false}, {"data": [0.5285229278175376, 500, 1500, "[PET] UPDATE PET BY ID AFTER UPDATE"], "isController": false}, {"data": [0.529613137608487, 500, 1500, "[PET] UPDATE PET BY ID"], "isController": false}, {"data": [0.5390052031551216, 500, 1500, "[PET] GET PET BY ID AFTER UPDATE"], "isController": false}, {"data": [0.6679449877492396, 500, 1500, "[STORE] GET ORDER BY ID"], "isController": false}, {"data": [0.6870467402270194, 500, 1500, "[USER] UPDATE USER BY ID"], "isController": false}, {"data": [0.5377586266040061, 500, 1500, "[PET] GET PETS BY STATUS"], "isController": false}, {"data": [0.6706739588914903, 500, 1500, "[STORE] GET INVENTORY"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3410771, 0, 0.0, 844.4461284560053, 8, 3800, 2009.0, 2440.0, 2566.0, 2820.980000000003, 473.5905223327989, 542.2807609640843, 101.68706209613319], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[PET] GET PET BY ID", 379431, 0, 0.0, 962.1275198916305, 8, 3793, 2208.0, 2567.0, 2685.0, 2939.970000000005, 52.68461296218848, 11.728975120842573, 8.124945999733127], "isController": false}, {"data": ["[STORE] GET ORDER BY ID AFTER UPDATE", 378536, 0, 0.0, 696.3262331720196, 8, 2781, 1913.0, 2041.9000000000015, 2079.0, 2165.0, 52.56622367113143, 9.130594917117822, 8.470143462633482], "isController": false}, {"data": ["[PET] UPDATE PET BY ID AFTER UPDATE", 379081, 0, 0.0, 983.0362930349604, 14, 3644, 2230.0, 2588.0, 2701.0, 2935.9900000000016, 52.63688462891219, 7.196449070359089, 16.140607200662526], "isController": false}, {"data": ["[PET] UPDATE PET BY ID", 379308, 0, 0.0, 982.1222463011633, 12, 3735, 2226.0, 2582.0, 2699.0, 2942.0, 52.66792911515579, 7.200693433712707, 15.738658505114916], "isController": false}, {"data": ["[PET] GET PET BY ID AFTER UPDATE", 379193, 0, 0.0, 960.4256539545792, 8, 3416, 2202.0, 2563.0, 2685.0, 2928.9900000000016, 52.65220231760056, 11.930526244490126, 8.072652113147742], "isController": false}, {"data": ["[STORE] GET ORDER BY ID", 378752, 0, 0.0, 698.472343380354, 8, 2620, 1917.0, 2043.0, 2082.0, 2181.0, 52.59370656268789, 9.135377563322141, 8.521843023021688], "isController": false}, {"data": ["[USER] UPDATE USER BY ID", 378646, 0, 0.0, 659.7298849057006, 10, 2268, 1876.0, 1985.0, 2017.0, 2076.0, 52.579907306191735, 9.08170589840591, 18.947251753891358], "isController": false}, {"data": ["[PET] GET PETS BY STATUS", 378973, 0, 0.0, 963.259361484871, 8, 3800, 2205.0, 2569.0, 2689.0, 2937.0, 52.62218798373512, 469.64688145392375, 9.09582741515734], "isController": false}, {"data": ["[STORE] GET INVENTORY", 378851, 0, 0.0, 693.68103027312, 8, 2648, 1912.0, 2039.0, 2077.0, 2167.0, 52.60716155361862, 7.2437595498635, 8.579488261185848], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3410771, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
