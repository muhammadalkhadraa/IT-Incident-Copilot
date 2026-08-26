FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["ITIncidentCopilot.Api.csproj", "./"]
RUN dotnet restore "ITIncidentCopilot.Api.csproj"
COPY . .
RUN dotnet build "ITIncidentCopilot.Api.csproj" -c Release -o /app/build
RUN dotnet publish "ITIncidentCopilot.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ITIncidentCopilot.Api.dll"]
