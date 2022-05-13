import pandas as pd
import numpy as np

#df = pd.read_csv("/Users/Garrido/Documents/GitHub/P10/benchmark-results/csharp/monolithic-service/RAPL-MonolithicService.csv")
df = pd.read_csv("/Users/Garrido/Documents/GitHub/P10/benchmark-results/csharp/ApiGatewayService/RAPL-Microservice.csv")
for x in range(0, 8100, 450):
    value_by_thread_count = df.loc[df['time_elapsed'].between(x, x+450)]['watts_since_last']
    print(np.std(value_by_thread_count))
