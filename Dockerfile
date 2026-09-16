FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/ITIncidentCopilot.Api.csproj", "backend/"]
RUN dotnet restore "backend/ITIncidentCopilot.Api.csproj"
COPY . .
WORKDIR "/src/backend"
RUN dotnet build "ITIncidentCopilot.Api.csproj" -c Release -o /app/build
RUN dotnet publish "ITIncidentCopilot.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV PORT=5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "ITIncidentCopilot.Api.dll"]
