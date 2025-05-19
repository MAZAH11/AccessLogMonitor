using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using Parts;

namespace AccessLogMonitor
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(options =>
                options.AddDefaultPolicy(policy =>
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                          .AllowAnyMethod()));

            var app = builder.Build();


            app.UseCors();


            var users = new List<User>
            {
                new User { Name = "Tanya", Level = AccessLevel.Admin },
                new User { Name = "Bil",   Level = AccessLevel.Employee },
                new User { Name = "Jack",  Level = AccessLevel.Guest }
            };
            var rooms = new List<Room>
            {
                new Room { Name = "3rd Floor",       RequiredLevel = AccessLevel.Admin },
                new Room { Name = "Employee Lounge", RequiredLevel = AccessLevel.Employee },
                new Room { Name = "Lobby",           RequiredLevel = AccessLevel.Guest }
            };
            var logs = new List<AccessLog>();


            app.MapPost("/access", (AccessRequest request) =>
            {
                var u = (request.UserName ?? "").Trim();
                var r = (request.RoomName ?? "").Trim();
                if (string.IsNullOrEmpty(u) || string.IsNullOrEmpty(r))
                    return Results.BadRequest("Username and Room name must be provided.");

                var user = users.FirstOrDefault(x => x.Name.Equals(u, StringComparison.OrdinalIgnoreCase));
                var room = rooms.FirstOrDefault(x => x.Name.Equals(r, StringComparison.OrdinalIgnoreCase));
                if (user == null || room == null)
                    return Results.NotFound("User or room not found.");

                bool granted = user.Level >= room.RequiredLevel;
                var log = new AccessLog
                {
                    Timestamp = DateTime.UtcNow,
                    UserName = user.Name,
                    RoomName = room.Name,
                    AccessGranted = granted
                };
                logs.Add(log);

                return Results.Ok(new { log, message = granted ? "Access Granted" : "Access Denied" });
            });


            app.MapGet("/logs", () => logs);


            app.MapGet("/export", () =>
            {
                var lines = logs.Select(l =>

                    $"{l.Timestamp.ToLocalTime():M/d/yyyy h:mm:ss tt},{l.UserName},{l.RoomName},{l.AccessGranted}"
                );
                System.IO.File.WriteAllLines("access_logs.txt", lines);
                return Results.Ok("Logs written to access_logs.txt on server");
            });


            app.MapGet("/download", () =>
            {
                const string serverFile = "access_logs.txt";
                var lines = logs.Select(l =>
                    $"{l.Timestamp.ToLocalTime():M/d/yyyy h:mm:ss tt},{l.UserName},{l.RoomName},{l.AccessGranted}"
                );
                System.IO.File.WriteAllLines(serverFile, lines);
                var bytes = System.IO.File.ReadAllBytes(serverFile);
                return Results.File(bytes, "text/plain", "accesslog.txt");
            });

            app.Run();
        }
    }
}
