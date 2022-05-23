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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9669950940815881, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9915349736289931, 500, 1500, "[PET] GET PET BY ID"], "isController": false}, {"data": [0.998520224510115, 500, 1500, "[STORE] GET ORDER BY ID AFTER UPDATE"], "isController": false}, {"data": [0.8820361511967352, 500, 1500, "[PET] UPDATE PET BY ID AFTER UPDATE"], "isController": false}, {"data": [0.8806771027622886, 500, 1500, "[PET] UPDATE PET BY ID"], "isController": false}, {"data": [0.9912874179815345, 500, 1500, "[PET] GET PET BY ID AFTER UPDATE"], "isController": false}, {"data": [0.9987479433754353, 500, 1500, "[STORE] GET ORDER BY ID"], "isController": false}, {"data": [0.9700347976720509, 500, 1500, "[USER] UPDATE USER BY ID"], "isController": false}, {"data": [0.9912763668848334, 500, 1500, "[PET] GET PETS BY STATUS"], "isController": false}, {"data": [0.9988714340323717, 500, 1500, "[STORE] GET INVENTORY"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 14810071, 0, 0.0, 194.36937176059686, 0, 3313, 439.0, 694.0, 732.0, 875.9900000000016, 2056.876029995525, 2322.9294548536886, 441.64705884261315], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["[PET] GET PET BY ID", 1646126, 0, 0.0, 167.17296428098533, 1, 2025, 347.0, 496.0, 540.0, 1009.0, 228.62079990044785, 53.79949987667956, 35.257621319466026], "isController": false}, {"data": ["[STORE] GET ORDER BY ID AFTER UPDATE", 1645182, 0, 0.0, 128.07180482159166, 1, 855, 398.0, 474.0, 498.0, 548.9900000000016, 228.50175267150806, 56.67914568219047, 36.81913006913948], "isController": false}, {"data": ["[PET] UPDATE PET BY ID AFTER UPDATE", 1645644, 0, 0.0, 328.3123056991714, 2, 3202, 703.0, 839.0, 1030.0, 1748.9900000000016, 228.55760342038363, 54.811273298717744, 70.08504636132858], "isController": false}, {"data": ["[PET] UPDATE PET BY ID", 1645954, 0, 0.0, 328.22781560116226, 2, 3313, 686.0, 825.0, 925.0, 1644.9800000000032, 228.5997692272223, 54.62991905357676, 68.31204041360354], "isController": false}, {"data": ["[PET] GET PET BY ID AFTER UPDATE", 1645666, 0, 0.0, 170.81693916019475, 0, 1992, 429.0, 511.0, 543.0, 1125.9800000000032, 228.5615795005041, 54.675474611963665, 35.04313279451088], "isController": false}, {"data": ["[STORE] GET ORDER BY ID", 1645293, 0, 0.0, 129.46672234064414, 0, 920, 378.0, 466.0, 493.0, 541.0, 228.51380533146516, 56.887465152642264, 37.026401993950465], "isController": false}, {"data": ["[USER] UPDATE USER BY ID", 1645225, 0, 0.0, 194.05371788052943, 2, 2974, 440.0, 622.0, 1476.8500000000022, 2028.9700000000048, 228.5053764336925, 67.83753362875247, 82.34226943753177], "isController": false}, {"data": ["[PET] GET PETS BY STATUS", 1645530, 0, 0.0, 173.8817693995251, 1, 1972, 432.0, 522.0, 573.0, 1210.0, 228.54326222163334, 1887.9648256626383, 39.50405997385654], "isController": false}, {"data": ["[STORE] GET INVENTORY", 1645451, 0, 0.0, 129.26178050880804, 0, 959, 387.0, 465.0, 488.0, 544.0, 228.5333375555274, 35.708333993051156, 37.270573605247144], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 14810071, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
