FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS base
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:80
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
RUN curl -SLO https://deb.nodesource.com/nsolid_setup_deb.sh
RUN chmod 500 nsolid_setup_deb.sh
RUN ./nsolid_setup_deb.sh 21
RUN apt-get install nodejs -y
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

COPY ["LocalShare/LocalShare.csproj", "LocalShare/"]

RUN dotnet restore "LocalShare/LocalShare.csproj"
COPY . .
WORKDIR "/src/LocalShare"
RUN dotnet build "LocalShare.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "LocalShare.csproj" -v diag --no-restore -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app

EXPOSE 80

# Copy HTTPS certificate
COPY aspnetapp.pfx /https/aspnetapp.pfx

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LocalShare.dll"]
