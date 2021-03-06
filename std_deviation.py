import pandas as pd
import numpy as np
import json


#df = pd.read_csv("/Users/Garrido/Documents/GitHub/P10/benchmark-results/java/ApiGatewayService-java/RAPL-Microservice3.csv")
#df2 = pd.read_csv("/Users/Garrido/Documents/GitHub/P10/benchmark-results/java/monolithic-service-java/RAPL-MonolithicService3.csv")
#df = pd.read_csv("/Users/Garrido/Documents/GitHub/P10/benchmark-results/csharp/ApiGatewayService/RAPL-Microservice3.csv")
df2 = pd.read_csv("/Users/Garrido/Documents/GitHub/P10/benchmark-results/csharp/monolithic-service/RAPL-MonolithicService3.csv")
df = pd.read_csv("/Users/Garrido/Documents/GitHub/P10/benchmark-results/csharp/ApiGatewayService/RAPL-Microservice.csv")
#df2 = pd.read_csv("/Users/Garrido/Documents/GitHub/P10/benchmark-results/csharp/ApiGatewayService/databaseTest/RAPL-MicroserviceDB.csv")
#df = pd.read_csv("/Users/Garrido/Documents/GitHub/P10/benchmark-results/java/ApiGatewayService-java/RAPL-Microservice3.csv")
#df2 = pd.read_csv("/Users/Garrido/Documents/GitHub/P10/benchmark-results/java/ApiGatewayService-java/databaseTest/RAPL-MicroserviceJavaDB.csv")

std_deviations = {}
means = {}
df = df.loc[(df['time_elapsed'].between(450, 7650))]
df2 = df2.loc[(df2['time_elapsed'].between(450, 7650))]
df = df.loc[(df['time_elapsed'].between(0, 5245))]
df2 = df2.loc[(df2['time_elapsed'].between(0, 5245))]

overall_means1 = format(np.mean(df.loc[(df["zone"] == "package-0")]['watts_since_last']), ".2f")
overall_means2 = format(np.mean(df2.loc[(df2["zone"] == "package-0")]['watts_since_last']), ".2f")
overall_std1 = format(np.std(df.loc[(df["zone"] == "package-0")]['watts_since_last']), ".2f")
overall_std2 = format(np.std(df2.loc[(df2["zone"] == "package-0")]['watts_since_last']), ".2f")

for x in range(450, 7650, 450):
    value_by_thread_count = df.loc[(df["zone"] == "package-0") & (df['time_elapsed'].between(x, x+450))]['watts_since_last']
    print(value_by_thread_count)
    std_deviations[str(x)] = [format(np.std(value_by_thread_count), ".2f")]
    means[str(x)] = [format(np.mean(value_by_thread_count), ".2f")]

for x in range(450, 7650, 450):
    value_by_thread_count = df2.loc[(df2["zone"] == "package-0") & (df['time_elapsed'].between(x, x+450))]['watts_since_last']
    std_deviations[str(x)].append(format(np.std(value_by_thread_count), ".2f"))
    means[str(x)].append(format(np.mean(value_by_thread_count), ".2f"))

#print("Standard deviations:")
#print(json.dumps(std_deviations, indent=4, sort_keys=False))
#print("--------------")
print("Means:")
print(json.dumps(means, indent=4, sort_keys=False))

print("-------------")
print("Microservice mean: " + str(overall_means1))
print("Monolith mean: " + str(overall_means2))
print("-------------")
print("Microservice std.: " + str(overall_std1))
print("Monolith std.: " + str(overall_std2))