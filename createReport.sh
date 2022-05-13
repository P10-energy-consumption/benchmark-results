#! /bin/sh

../../Downloads/apache-jmeter-5.4.3/bin/jmeter -g data/JMeterClients3MicroserviceJava.csv -o "JMeter reports"/csharp_micro -Jjmeter.reportgenerator.overall_granularity=1000