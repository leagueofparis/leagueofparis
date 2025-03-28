# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy project files and restore dependencies
COPY webapi.csproj ./
RUN dotnet restore

# Copy the rest of the code and publish
COPY . . 
RUN dotnet publish -c Release -o out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .

# Configure for Render
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "webapi.dll"]
